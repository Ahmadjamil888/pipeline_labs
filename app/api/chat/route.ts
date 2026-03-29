import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { agentRegistry, AgentContext, AIProvider } from '@/app/agents'
import { supabaseAdmin, STORAGE_BUCKETS, downloadFromStorage } from '@/lib/clerk-supabase'
import { parseFile, getDatasetStats } from '@/lib/preprocessing'

export async function POST(req: NextRequest) {
  try {
    const { message, datasetId, history, fileData, userId, provider, model } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Resolve auth
    const { userId: clerkUserId } = await auth()
    const resolvedUserId = clerkUserId || userId || 'anonymous'

    // If a datasetId is provided, fetch dataset info and sample data for the agent
    let enrichedFileData = fileData
    let datasetContext = ''

    if (datasetId && resolvedUserId !== 'anonymous') {
      try {
        // Resolve profile UUID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('clerk_user_id', resolvedUserId)
          .single()

        const profileId = profile?.id

        const { data: dataset } = await supabaseAdmin
          .from('datasets')
          .select('*')
          .eq('id', datasetId)
          .eq('user_id', profileId)
          .single()

        if (dataset) {
          // Download and parse the file to get a sample
          try {
            const fileBlob = await downloadFromStorage(STORAGE_BUCKETS.DATASETS, dataset.storage_path)
            const arrayBuffer = await fileBlob.arrayBuffer()
            const df = await parseFile(arrayBuffer, dataset.file_type)
            const stats = getDatasetStats(df)

            // Get first 20 rows as CSV sample
            const sampleDf = df.head(20)
            const headers = sampleDf.columns.join(',')
            const rows = (sampleDf.values as unknown[][]).map(row => row.join(',')).join('\n')
            const sampleCsv = `${headers}\n${rows}`

            datasetContext = `Dataset: ${dataset.name} | ${stats.rowCount} rows × ${stats.columnCount} columns | Columns: ${stats.columnNames.join(', ')}`

            enrichedFileData = {
              content: sampleCsv,
              fileName: dataset.original_filename,
              fileType: dataset.file_type,
              stats: {
                rowCount: stats.rowCount,
                columnCount: stats.columnCount,
                columnNames: stats.columnNames,
                columnTypes: stats.columnTypes,
                missingValues: stats.missingValues,
              }
            }
          } catch (e) {
            // If we can't download, at least pass metadata
            datasetContext = `Dataset: ${dataset.name} | ${dataset.row_count} rows × ${dataset.column_count} columns`
          }
        }
      } catch (e) {
        console.error('Failed to enrich dataset context:', e)
      }
    }

    // Build context with optional provider/model override
    const context: AgentContext = {
      userId: resolvedUserId,
      datasetId,
      message: datasetContext ? `${message}\n\n[${datasetContext}]` : message,
      history: history || [],
      fileData: enrichedFileData,
      provider: provider as AIProvider,
      model
    }

    // Route to appropriate agent
    const agent = await agentRegistry.route(message)
    
    console.log(`Routing to agent: ${agent.name}${provider ? ` with provider: ${provider}` : ''}`)

    // Execute agent
    const result = await agent.handle(context)

    return NextResponse.json({
      content: result.content,
      agent: agent.name,
      provider: result.provider || agent.provider,
      model: model || agent.model,
      actions: result.actions,
      downloadUrl: result.downloadUrl,
      processingTime: result.processingTime,
      data: result.data
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    
    return NextResponse.json({
      content: `I apologize, but I'm having trouble processing your request. Please try again.`,
      agent: 'MainAgent',
      error: error.message
    }, { status: 200 })
  }
}

// List available agents
export async function GET() {
  const agents = agentRegistry.list().map(agent => ({
    name: agent.name,
    description: agent.description,
    model: agent.model,
    provider: agent.provider
  }))

  return NextResponse.json({ agents })
}
