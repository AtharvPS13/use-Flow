import { useState, useEffect } from 'react'

function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState([])

  useEffect(() => {
    // Simulated data for demo - replace with actual electron API
    const mockWorkspaces = [
      {
        name: 'Dev Flow',
        actions: [
          { type: 'chrome', value: 'https://github.com' },
          { type: 'vscode', value: '/home/user/project/src' }
        ]
      }
    ]
    setWorkspaces(mockWorkspaces)
  }, [])

  const addWorkspace = (name) => {
    if (!name) return alert('Enter a workspace name!')
    const newWorkspace = { name, actions: [] }
    const newWorkspaces = [...workspaces, newWorkspace]
    setWorkspaces(newWorkspaces)
    // saveAll(newWorkspaces)
  }

  const addAction = async (wsIndex, type, value) => {
    if (type === 'vscode') {
      // Simulated file picker - replace with actual electron API
      const pickedFile = '/home/user/example/file.js'
      if (!pickedFile) return
      value = pickedFile
    }
    if (!value) return alert('Enter a value!')

    const newWorkspaces = [...workspaces]
    newWorkspaces[wsIndex].actions.push({ type, value })
    setWorkspaces(newWorkspaces)
    // saveAll(newWorkspaces)
  }

  const startWorkspace = (ws) => {
    console.log('Starting workspace:', ws)
    // window.electronAPI.startWorkspace(ws)
  }

  const deleteWorkspace = (wsIndex) => {
    const newWorkspaces = workspaces.filter((_, i) => i !== wsIndex)
    setWorkspaces(newWorkspaces)
    // saveAll(newWorkspaces)
  }

  return (
    <div className="min-h-screen bg-base-100 p-4" data-theme="synthwave">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="hero min-h-[40vh] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-box mb-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FlowState
              </h1>
              <p className="py-6 text-lg opacity-90">
                Design your perfect workflow. Launch multiple apps, files, and terminals with a
                single click.
                <span className="text-accent font-semibold"> Productivity, amplified.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Create Workspace Card */}
        <div className="card bg-base-200/50 backdrop-blur-sm border border-base-300 mb-8">
          <div className="card-body">
            <h2 className="card-title text-accent">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create New Workspace
            </h2>
            <div className="form-control">
              <div className="input-group">
                <input
                  id="workspaceName"
                  type="text"
                  placeholder="Enter workspace name..."
                  className="input input-bordered input-primary flex-1 bg-base-100/50"
                />
                <button
                  onClick={() => {
                    const name = document.getElementById('workspaceName').value.trim()
                    addWorkspace(name)
                    document.getElementById('workspaceName').value = ''
                  }}
                  className="btn btn-primary"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Workspaces */}
        <div className="space-y-6">
          {workspaces.map((ws, i) => (
            <div
              key={i}
              className="card bg-base-200/30 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300"
            >
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="card-title text-2xl text-primary">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                    {ws.name}
                  </h3>
                  <div className="badge badge-secondary">{ws.actions.length} actions</div>
                </div>

                {/* Add Action */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <select
                    id={`actionType-${i}`}
                    className="select select-bordered select-sm bg-base-100/50"
                  >
                    <option value="chrome">🌐 Chrome Tab</option>
                    <option value="vscode">💻 VS Code</option>
                    <option value="terminal">⚡ Terminal</option>
                  </select>
                  <input
                    id={`actionValue-${i}`}
                    type="text"
                    placeholder="URL, path, or command..."
                    className="input input-bordered input-sm bg-base-100/50 col-span-1 md:col-span-1"
                  />
                  <button
                    onClick={() => {
                      const type = document.getElementById(`actionType-${i}`).value
                      const value = document.getElementById(`actionValue-${i}`).value.trim()
                      addAction(i, type, value)
                      document.getElementById(`actionValue-${i}`).value = ''
                    }}
                    className="btn btn-accent btn-sm"
                  >
                    + Add
                  </button>
                </div>

                {/* Actions List */}
                {ws.actions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {ws.actions.map((action, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 p-2 bg-base-100/30 rounded-lg border border-base-300/50"
                      >
                        <div className="badge badge-outline badge-sm">
                          {action.type === 'chrome' && '🌐'}
                          {action.type === 'vscode' && '💻'}
                          {action.type === 'terminal' && '⚡'}
                          {action.type}
                        </div>
                        <span className="text-sm font-mono opacity-80 truncate flex-1">
                          {action.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="card-actions justify-between">
                  <button
                    onClick={() => startWorkspace(ws)}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Launch {ws.name}
                  </button>
                  <button
                    onClick={() => deleteWorkspace(i)}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {workspaces.length === 0 && (
          <div className="text-center py-12 opacity-60">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-lg">No workspaces yet. Create your first flow above!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkspaceManager
