export default function Head() {
  const title = "Pipeline Labs | AI Data Infrastructure for Machine Learning";
  const description =
    "Pipeline Labs transforms messy source data into validated, training-ready datasets with AI-native cleaning, schema-aware chunking, and programmable ML workflows.";
  const canonical = "https://pipeline-labs.vercel.app";
  const image = `${canonical}/logo-dark.png`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="AI data infrastructure, machine learning platform, dataset cleaning, ML preprocessing, feature engineering, training-ready datasets, data quality automation"
      />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Pipeline Labs" />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
