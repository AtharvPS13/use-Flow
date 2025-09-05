import { useState, useEffect } from 'react'

function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState([])

  useEffect(() => {
    window.electronAPI.loadWorkspaces().then((ws) => {
      if (ws) setWorkspaces(ws)
    })
  }, [])

  const addWorkspace = (name) => {
    if (!name) return alert('Enter a workspace name!')
    setWorkspaces([...workspaces, { name, actions: [] }])
    saveAll([...workspaces, { name, actions: [] }])
  }

  const addAction = async (wsIndex, type, value) => {
    if (type === 'vscode') {
      const pickedFile = await window.electronAPI.pickFile()
      if (!pickedFile) return
      value = pickedFile
    }
    if (!value) return alert('Enter a value!')

    const newWorkspaces = [...workspaces]
    newWorkspaces[wsIndex].actions.push({ type, value })
    setWorkspaces(newWorkspaces)
    saveAll(newWorkspaces)
  }

  const startWorkspace = (ws) => {
    window.electronAPI.startWorkspace(ws)
  }

  const deleteWorkspace = (wsIndex) => {
    const newWorkspaces = workspaces.filter((_, i) => i !== wsIndex)
    setWorkspaces(newWorkspaces)
    saveAll(newWorkspaces)
  }

  const deleteAction = (wsIndex, actionIndex) => {
    const newWorkspaces = [...workspaces]
    newWorkspaces[wsIndex].actions = newWorkspaces[wsIndex].actions.filter(
      (_, i) => i !== actionIndex
    )
    setWorkspaces(newWorkspaces)
    saveAll(newWorkspaces)
  }

  const saveAll = (ws) => {
    window.electronAPI.saveWorkspaces(ws)
  }

  const getActionIcon = (type) => {
    switch (type) {
      case 'chrome':
        return '🌐'
      case 'vscode':
        return '💻'
      case 'terminal':
        return '⚡'
      default:
        return '📝'
    }
  }

  return (
    <div className="min-h-screen bg-base-100" data-theme="synthwave">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            useFlow
          </h1>
          <p className="text-base-content/70">Workspace automation for developers</p>
        </div>

        {/* Create Workspace Card */}
        <div className="card bg-base-200 shadow-xl mb-6 border border-primary/20">
          <div className="card-body">
            <h2 className="card-title text-primary">
              <span className="text-2xl">⚡</span>
              Create New Workspace
            </h2>
            <div className="flex gap-3">
              <input
                id="workspaceName"
                placeholder="Workspace name (e.g., React Project, CP Setup)"
                className="input input-bordered input-primary flex-1"
              />
              <button
                onClick={() => {
                  const name = document.getElementById('workspaceName').value.trim()
                  addWorkspace(name)
                  document.getElementById('workspaceName').value = ''
                }}
                className="btn btn-primary"
              >
                <span className="text-lg">+</span>
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Workspaces */}
        <div className="space-y-6">
          {workspaces.length === 0 ? (
            <div className="card bg-base-200 shadow-xl border border-secondary/20">
              <div className="card-body text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-secondary">No workspaces yet</h3>
                <p className="text-base-content/70">Create your first workspace to get started!</p>
              </div>
            </div>
          ) : (
            workspaces.map((ws, i) => (
              <div
                key={i}
                className="card bg-base-200 shadow-xl border border-accent/20 hover:border-accent/40 transition-colors"
              >
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="card-title text-accent text-2xl">
                      <span className="text-2xl">💼</span>
                      {ws.name}
                    </h3>
                    <div className="badge badge-secondary">{ws.actions.length} actions</div>
                  </div>

                  {/* Add Action Section */}
                  <div className="bg-base-300 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-primary mb-3">Add Action</h4>
                    <div className="flex gap-2 flex-wrap">
                      <select id={`actionType-${i}`} className="select select-bordered select-sm">
                        <option value="chrome">🌐 Chrome Tab</option>
                        <option value="vscode">💻 VS Code File</option>
                        <option value="terminal">⚡ Terminal</option>
                      </select>
                      <input
                        id={`actionValue-${i}`}
                        placeholder="Enter URL or File Path"
                        className="input input-bordered input-sm flex-1 min-w-0"
                      />
                      <button
                        onClick={() => {
                          const type = document.getElementById(`actionType-${i}`).value
                          const value = document.getElementById(`actionValue-${i}`).value.trim()
                          addAction(i, type, value)
                          document.getElementById(`actionValue-${i}`).value = ''
                        }}
                        className="btn btn-success btn-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Actions List */}
                  {ws.actions.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {ws.actions.map((action, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between bg-base-100 p-3 rounded-lg border border-base-300"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getActionIcon(action.type)}</span>
                            <div>
                              <div className="font-medium text-sm uppercase tracking-wide text-primary">
                                {action.type}
                              </div>
                              <div className="text-base-content/80 break-all">{action.value}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAction(i, j)}
                            className="btn btn-ghost btn-xs text-error hover:bg-error/20"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Control Buttons */}
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => startWorkspace(ws)} className="btn btn-primary">
                      <span className="text-lg">▶</span>
                      Start {ws.name}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete workspace "${ws.name}"?`)) {
                          deleteWorkspace(i)
                        }
                      }}
                      className="btn btn-error"
                    >
                      <span className="text-lg">🗑</span>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-base-content/50">
          <p>Built with 💜 for developers who love automation</p>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceManager
