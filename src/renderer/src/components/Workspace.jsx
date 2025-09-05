import { useState, useEffect, useRef } from 'react'

function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState([])
  const [workspaceName, setWorkspaceName] = useState('')
  const workspaceRefs = useRef({})

  // Load workspaces on mount
  useEffect(() => {
    window.electronAPI.loadWorkspaces().then((ws) => {
      if (ws) {
        ws.sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))
        setWorkspaces(ws)
      }
    })
  }, [])

  const saveAll = (ws) => window.electronAPI.saveWorkspaces(ws)

  const addWorkspace = (name) => {
    if (!name) return alert('Enter a workspace name!')
    const newWorkspace = { id: Date.now() + Math.random(), name, actions: [], lastOpened: Date.now() }
    const newWorkspaces = [newWorkspace, ...workspaces]
    setWorkspaces(newWorkspaces)
    saveAll(newWorkspaces)
    setWorkspaceName('')
  }

  const addAction = async (workspaceId, type, value) => {
    if (type === 'vscode') {
      const pickedFile = await window.electronAPI.pickFile()
      if (!pickedFile) return
      value = pickedFile
    }
    if (!value) return alert('Enter a value!')

    const updatedWorkspaces = workspaces.map((ws) => {
      if (ws.id === workspaceId) return { ...ws, actions: [...ws.actions, { type, value }] }
      return ws
    })
    setWorkspaces(updatedWorkspaces)
    saveAll(updatedWorkspaces)
  }

  const deleteWorkspace = (workspaceId) => {
    const updatedWorkspaces = workspaces.filter((ws) => ws.id !== workspaceId)
    setWorkspaces(updatedWorkspaces)
    saveAll(updatedWorkspaces)
  }

  const deleteAction = (workspaceId, actionIndex) => {
    const updatedWorkspaces = workspaces.map((ws) => {
      if (ws.id === workspaceId)
        return { ...ws, actions: ws.actions.filter((_, i) => i !== actionIndex) }
      return ws
    })
    setWorkspaces(updatedWorkspaces)
    saveAll(updatedWorkspaces)
  }

  const startWorkspace = (ws) => {
    window.electronAPI.startWorkspace(ws)

    const updatedWorkspaces = workspaces.map((w) =>
      w.id === ws.id ? { ...w, lastOpened: Date.now() } : w
    )
    updatedWorkspaces.sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))
    setWorkspaces(updatedWorkspaces)
    saveAll(updatedWorkspaces)

    // Scroll into view after re-render
    setTimeout(() => {
      const el = workspaceRefs.current[ws.id]
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
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
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-thin text-transparent bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text mb-4">
            Workspace Manager
          </h1>
          <p className="text-base-content/60 text-lg font-light tracking-wide">
            Streamline your neon-powered development environment
          </p>
        </div>

        {/* Create Workspace */}
        <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-primary/20 shadow-lg shadow-primary/10">
          <div className="flex gap-4 items-center">
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Enter workspace name..."
              className="input bg-base-200/50 border border-primary/30 rounded-xl flex-1 text-lg placeholder-base-content/50 focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all duration-300"
            />
            <button
              onClick={() => addWorkspace(workspaceName.trim())}
              className="btn btn-primary rounded-xl px-8 font-normal shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
            >
              Create
            </button>
          </div>
        </div>

        {/* Workspaces */}
        {workspaces.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-2xl font-light text-secondary mb-3">No workspaces yet</h3>
            <p className="text-base-content/60">Create your first neon workspace to get started</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                ref={(el) => (workspaceRefs.current[ws.id] = el)}
                className="bg-gradient-to-r from-base-200/50 to-base-300/30 backdrop-blur-sm rounded-2xl border border-accent/30 overflow-hidden hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-500"
              >
                {/* Workspace Header */}
                <div className="px-8 py-6 border-b border-accent/20 bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/50"></div>
                      <h3 className="text-2xl font-light text-accent">{ws.name}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="badge badge-secondary badge-outline">
                        {ws.actions.length} {ws.actions.length === 1 ? 'action' : 'actions'}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Delete workspace "${ws.name}"?`)) {
                            deleteWorkspace(ws.id)
                          }
                        }}
                        className="text-2xl btn btn-ghost btn-xs text-error hover:text-error hover:bg-error/20 hover:shadow-lg hover:shadow-error/30 rounded-full transition-all duration-300"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6">
                  {/* Add Action */}
                  <div className="mb-8 p-4 bg-base-300/30 rounded-xl border border-primary/20">
                    <div className="flex gap-3 items-center">
                      <select
                        id={`actionType-${ws.id}`}
                        className="select select-bordered border-secondary/50 bg-base-200/70 focus:border-secondary focus:shadow-lg focus:shadow-secondary/20 rounded-lg"
                      >
                        <option value="chrome">🌐 Web</option>
                        <option value="vscode">💻 Code</option>
                        <option value="terminal">⚡ Terminal</option>
                      </select>
                      <input
                        id={`actionValue-${ws.id}`}
                        placeholder="URL, file path, or command..."
                        className="input input-bordered border-secondary/50 bg-base-200/70 flex-1 placeholder-base-content/50 focus:border-secondary focus:shadow-lg focus:shadow-secondary/20 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          const type = document.getElementById(`actionType-${ws.id}`).value
                          const value = document.getElementById(`actionValue-${ws.id}`).value.trim()
                          addAction(ws.id, type, value)
                          document.getElementById(`actionValue-${ws.id}`).value = ''
                        }}
                        className="btn btn-secondary rounded-lg px-6 hover:shadow-lg hover:shadow-secondary/30 transition-all duration-300"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Actions List */}
                  {ws.actions.length > 0 && (
                    <div className="space-y-3 mb-8">
                      {ws.actions.map((action, j) => (
                        <div
                          key={j}
                          className="group flex items-center justify-between p-4 bg-gradient-to-r from-base-200/40 to-base-300/30 rounded-xl border border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-xl filter drop-shadow-lg">
                              {getActionIcon(action.type)}
                            </span>
                            <div>
                              <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                                {action.type}
                              </div>
                              <div className="text-base-content/90 font-light break-all">
                                {action.value}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAction(ws.id, j)}
                            className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs text-error hover:text-error hover:bg-error/20 hover:shadow-lg hover:shadow-error/30 rounded-full transition-all duration-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Start Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => startWorkspace(ws)}
                      className="btn btn-accent rounded-xl px-8 font-normal shadow-lg shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all duration-300"
                    >
                      <span className="mr-2 text-lg">▶</span>
                      Launch {ws.name}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-20">
          <p className="text-base-content/40 text-sm font-light tracking-wide">
            Built with 💜 for synthwave developers
          </p>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceManager
