import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const serverStorageSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const STORAGE_BUCKETS = {
  DATASETS: 'datasets',
  PROCESSED: 'processed',
  TEMP: 'temp',
} as const;

const SUPABASE_SINGLE_UPLOAD_LIMIT = 50 * 1024 * 1024;
const INTERNAL_PART_SIZE = 5 * 1024 * 1024;
const MULTIPART_PREFIX = 'multipart://';
const GCS_PREFIX = 'gcs://';

type LogicalBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

type MultipartManifest = {
  version: 1;
  kind: 'multipart';
  provider: 'supabase';
  bucket: LogicalBucket;
  contentType: string;
  size: number;
  partSize: number;
  parts: string[];
};

function getEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

function getGcpConfig() {
  const projectId = getEnv('GCP_PROJECT_ID', 'GOOGLE_CLOUD_PROJECT_ID');
  const clientEmail = getEnv('GCP_CLIENT_EMAIL', 'GOOGLE_CLOUD_CLIENT_EMAIL');
  const privateKey = getEnv('GCP_PRIVATE_KEY', 'GOOGLE_CLOUD_PRIVATE_KEY')?.replace(/\\n/g, '\n');
  const serviceAccountJson = getEnv('GCP_SERVICE_ACCOUNT_KEY_JSON');

  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      };
    } catch {
      return null;
    }
  }

  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function isGcpStorageConfigured() {
  return Boolean(getGcpConfig() && getEnv('GCP_STORAGE_BUCKET', 'GCP_DATASETS_BUCKET', 'GCP_PROCESSED_BUCKET'));
}

async function getGcsClient() {
  const config = getGcpConfig();
  if (!config) return null;

  const mod = await import('@google-cloud/storage');
  return new mod.Storage({
    projectId: config.projectId,
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
  });
}

function getGcpBucketName(bucket: LogicalBucket) {
  return (
    (bucket === STORAGE_BUCKETS.DATASETS && getEnv('GCP_DATASETS_BUCKET')) ||
    (bucket === STORAGE_BUCKETS.PROCESSED && getEnv('GCP_PROCESSED_BUCKET')) ||
    (bucket === STORAGE_BUCKETS.TEMP && getEnv('GCP_TEMP_BUCKET')) ||
    getEnv('GCP_STORAGE_BUCKET')
  );
}

function multipartPath(manifestPath: string) {
  return `${MULTIPART_PREFIX}${manifestPath}`;
}

function isMultipartPath(path: string) {
  return path.startsWith(MULTIPART_PREFIX);
}

function isGcsPath(path: string) {
  return path.startsWith(GCS_PREFIX);
}

function unwrapMultipartPath(path: string) {
  return path.slice(MULTIPART_PREFIX.length);
}

function parseGcsPath(path: string) {
  const stripped = path.slice(GCS_PREFIX.length);
  const slashIndex = stripped.indexOf('/');
  if (slashIndex === -1) throw new Error(`Invalid GCS path: ${path}`);
  return {
    bucket: stripped.slice(0, slashIndex),
    objectPath: stripped.slice(slashIndex + 1),
  };
}

async function toBuffer(file: Buffer | Blob | ArrayBuffer | Uint8Array | string) {
  if (Buffer.isBuffer(file)) return file;
  if (typeof file === 'string') return Buffer.from(file);
  if (file instanceof ArrayBuffer) return Buffer.from(file);
  if (file instanceof Uint8Array) return Buffer.from(file);
  return Buffer.from(await file.arrayBuffer());
}

async function uploadSupabaseMultipart(
  bucket: LogicalBucket,
  path: string,
  file: Buffer | Blob | ArrayBuffer | Uint8Array | string,
  contentType: string,
) {
  const buffer = await toBuffer(file);
  const parts: string[] = [];

  for (let offset = 0, index = 0; offset < buffer.length; offset += INTERNAL_PART_SIZE, index += 1) {
    const partPath = `${path}.parts/${index.toString().padStart(6, '0')}`;
    const part = buffer.subarray(offset, Math.min(offset + INTERNAL_PART_SIZE, buffer.length));
    const { error } = await serverStorageSupabase.storage.from(bucket).upload(partPath, part, {
      contentType: 'application/octet-stream',
      upsert: true,
    });
    if (error) throw error;
    parts.push(partPath);
  }

  const manifestPath = `${path}.manifest.json`;
  const manifest: MultipartManifest = {
    version: 1,
    kind: 'multipart',
    provider: 'supabase',
    bucket,
    contentType,
    size: buffer.length,
    partSize: INTERNAL_PART_SIZE,
    parts,
  };

  const { error: manifestError } = await serverStorageSupabase.storage
    .from(bucket)
    .upload(manifestPath, Buffer.from(JSON.stringify(manifest)), {
      contentType: 'application/json',
      upsert: true,
    });

  if (manifestError) throw manifestError;

  return {
    storagePath: multipartPath(manifestPath),
    storageUrl: null,
    provider: 'supabase-multipart' as const,
  };
}

async function uploadGcsObject(
  bucket: LogicalBucket,
  path: string,
  file: Buffer | Blob | ArrayBuffer | Uint8Array | string,
  contentType: string,
) {
  const bucketName = getGcpBucketName(bucket);
  if (!bucketName) throw new Error(`Missing GCP bucket for ${bucket}`);
  const client = await getGcsClient();
  if (!client) throw new Error('GCP storage is not configured');

  const buffer = await toBuffer(file);
  const object = client.bucket(bucketName).file(path);
  await object.save(buffer, {
    contentType,
    resumable: buffer.length > 8 * 1024 * 1024,
  });

  return {
    storagePath: `${GCS_PREFIX}${bucketName}/${path}`,
    storageUrl: await getStorageAccessUrl(bucket, `${GCS_PREFIX}${bucketName}/${path}`),
    provider: 'gcs' as const,
  };
}

export async function storeFileBuffer(
  bucket: LogicalBucket,
  path: string,
  file: Buffer | Blob | ArrayBuffer | Uint8Array | string,
  contentType: string,
) {
  if (isGcpStorageConfigured()) {
    return uploadGcsObject(bucket, path, file, contentType);
  }

  const buffer = await toBuffer(file);
  if (buffer.length > SUPABASE_SINGLE_UPLOAD_LIMIT) {
    return uploadSupabaseMultipart(bucket, path, buffer, contentType);
  }

  const { error } = await serverStorageSupabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;

  return {
    storagePath: path,
    storageUrl: getPublicUrl(bucket, path),
    provider: 'supabase' as const,
  };
}

export function getPublicUrl(bucket: LogicalBucket, path: string) {
  if (isMultipartPath(path) || isGcsPath(path)) return null;
  const { data } = serverStorageSupabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getStorageAccessUrl(bucket: LogicalBucket, path: string) {
  if (isMultipartPath(path)) return null;

  if (isGcsPath(path)) {
    const { bucket: gcsBucket, objectPath } = parseGcsPath(path);
    const client = await getGcsClient();
    if (!client) return null;
    const [url] = await client.bucket(gcsBucket).file(objectPath).getSignedUrl({
      action: 'read',
      version: 'v4',
      expires: Date.now() + Number(getEnv('GCP_SIGNED_URL_TTL_SECONDS') || 3600) * 1000,
    });
    return url;
  }

  return getPublicUrl(bucket, path);
}

async function readSupabaseMultipart(bucket: LogicalBucket, path: string) {
  const manifestPath = unwrapMultipartPath(path);
  const { data: manifestBlob, error: manifestError } = await serverStorageSupabase.storage.from(bucket).download(manifestPath);
  if (manifestError || !manifestBlob) throw manifestError || new Error('Multipart manifest not found');

  const manifest = JSON.parse(await manifestBlob.text()) as MultipartManifest;
  const buffers: Buffer[] = [];

  for (const partPath of manifest.parts) {
    const { data, error } = await serverStorageSupabase.storage.from(bucket).download(partPath);
    if (error || !data) throw error || new Error(`Missing multipart chunk: ${partPath}`);
    buffers.push(Buffer.from(await data.arrayBuffer()));
  }

  const combined = Buffer.concat(buffers);
  return new Blob([new Uint8Array(combined)], { type: manifest.contentType });
}

export async function downloadFromStorage(bucket: LogicalBucket, path: string) {
  if (isMultipartPath(path)) {
    return readSupabaseMultipart(bucket, path);
  }

  if (isGcsPath(path)) {
    const { bucket: gcsBucket, objectPath } = parseGcsPath(path);
    const client = await getGcsClient();
    if (!client) throw new Error('GCP storage is not configured');
    const [buffer] = await client.bucket(gcsBucket).file(objectPath).download();
    return new Blob([new Uint8Array(buffer)]);
  }

  const { data, error } = await serverStorageSupabase.storage.from(bucket).download(path);
  if (error) throw error;
  return data;
}

export async function deleteFromStorage(bucket: LogicalBucket, paths: string[]) {
  const plainSupabasePaths: string[] = [];

  for (const path of paths) {
    if (!path) continue;

    if (isMultipartPath(path)) {
      const manifestPath = unwrapMultipartPath(path);
      const { data: manifestBlob } = await serverStorageSupabase.storage.from(bucket).download(manifestPath);
      if (manifestBlob) {
        try {
          const manifest = JSON.parse(await manifestBlob.text()) as MultipartManifest;
          const removalPaths = [...manifest.parts, manifestPath];
          await serverStorageSupabase.storage.from(bucket).remove(removalPaths);
        } catch {
          await serverStorageSupabase.storage.from(bucket).remove([manifestPath]);
        }
      }
      continue;
    }

    if (isGcsPath(path)) {
      const { bucket: gcsBucket, objectPath } = parseGcsPath(path);
      const client = await getGcsClient();
      if (client) {
        await client.bucket(gcsBucket).file(objectPath).delete({ ignoreNotFound: true });
      }
      continue;
    }

    plainSupabasePaths.push(path);
  }

  if (plainSupabasePaths.length > 0) {
    const { error } = await serverStorageSupabase.storage.from(bucket).remove(plainSupabasePaths);
    if (error) throw error;
  }
}

export function getStorageBackendName() {
  return isGcpStorageConfigured() ? 'gcp' : 'supabase';
}
