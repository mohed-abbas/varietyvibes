import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const { fixes } = await request.json()
    
    if (!fixes || !Array.isArray(fixes)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid fixes array provided'
      }, { status: 400 })
    }

    const results = []
    
    // Apply each fix
    for (const fix of fixes) {
      try {
        if (fix.startsWith('npm run ')) {
          const command = fix.replace('npm run ', '')
          const result = await runNpmCommand(command)
          results.push({
            fix,
            success: result.success,
            message: result.message
          })
        } else if (fix.startsWith('node ')) {
          const args = fix.split(' ').slice(1)
          const result = await runNodeScript(args)
          results.push({
            fix,
            success: result.success,
            message: result.message
          })
        } else {
          results.push({
            fix,
            success: false,
            message: 'Unsupported fix command format'
          })
        }
      } catch (error) {
        results.push({
          fix,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount === totalCount,
      message: `Applied ${successCount}/${totalCount} fixes successfully`,
      results
    })

  } catch (error) {
    console.error('Auto-fix failed:', error)
    
    return NextResponse.json({
      success: false,
      message: `Auto-fix failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

function runNpmCommand(command: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const npmProcess = spawn('npm', ['run', command], {
      stdio: 'pipe'
    })
    
    let output = ''
    let error = ''
    
    npmProcess.stdout.on('data', (data: Buffer) => {
      output += data.toString()
    })
    
    npmProcess.stderr.on('data', (data: Buffer) => {
      error += data.toString()
    })
    
    npmProcess.on('close', (code: number) => {
      if (code === 0) {
        resolve({
          success: true,
          message: `Command completed successfully: npm run ${command}`
        })
      } else {
        resolve({
          success: false,
          message: `Command failed (code ${code}): ${error || output}`
        })
      }
    })
    
    npmProcess.on('error', (err: Error) => {
      resolve({
        success: false,
        message: `Command error: ${err.message}`
      })
    })
    
    // Timeout after 30 seconds
    setTimeout(() => {
      npmProcess.kill()
      resolve({
        success: false,
        message: 'Command timed out after 30 seconds'
      })
    }, 30000)
  })
}

function runNodeScript(args: string[]): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const nodeProcess = spawn('node', args, {
      stdio: 'pipe'
    })
    
    let output = ''
    let error = ''
    
    nodeProcess.stdout.on('data', (data: Buffer) => {
      output += data.toString()
    })
    
    nodeProcess.stderr.on('data', (data: Buffer) => {
      error += data.toString()
    })
    
    nodeProcess.on('close', (code: number) => {
      if (code === 0) {
        resolve({
          success: true,
          message: `Script completed successfully: node ${args.join(' ')}`
        })
      } else {
        resolve({
          success: false,
          message: `Script failed (code ${code}): ${error || output}`
        })
      }
    })
    
    nodeProcess.on('error', (err: Error) => {
      resolve({
        success: false,
        message: `Script error: ${err.message}`
      })
    })
    
    // Timeout after 30 seconds
    setTimeout(() => {
      nodeProcess.kill()
      resolve({
        success: false,
        message: 'Script timed out after 30 seconds'
      })
    }, 30000)
  })
}