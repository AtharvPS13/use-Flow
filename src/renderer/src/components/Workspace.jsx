import { useState, useEffect, useRef } from 'react'

function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState([])
  const [workspaceName, setWorkspaceName] = useState('')
  const [actionInputs, setActionInputs] = useState({})
  const nextId = useRef(1)

  useEffect(() => {
    window.electronAPI.loadWorkspaces().then((ws) => {
      if (ws) {
        ws.sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))
        setWorkspaces(ws)
        const inputs = {}
        let maxId = 0
        ws.forEach((w) => {
          inputs[w.id] = { type: 'chrome', value: '' }
          if (w.id > maxId) maxId = w.id
        })
        setActionInputs(inputs)
        nextId.current = maxId + 1
      }
    })
  }, [])

  const saveAll = (ws) => window.electronAPI.saveWorkspaces(ws)

  const addWorkspace = (name) => {
    if (!name) return alert('Enter a workspace name!')
    const newWorkspace = {
      id: nextId.current++,
      name,
      actions: [],
      lastOpened: Date.now()
    }
    const newWorkspaces = [newWorkspace, ...workspaces]
    setWorkspaces(newWorkspaces)
    saveAll(newWorkspaces)
    setWorkspaceName('')
    setActionInputs((prev) => ({ ...prev, [newWorkspace.id]: { type: 'chrome', value: '' } }))
  }

  const handleInputChange = (workspaceId, field, val) => {
    setActionInputs((prev) => ({
      ...prev,
      [workspaceId]: { ...prev[workspaceId], [field]: val }
    }))
  }

  const addAction = async (workspaceId) => {
    const { type, value } = actionInputs[workspaceId] || {}
    let finalValue = value
    if (type === 'vscode') {
      const pickedFile = await window.electronAPI.pickFile()
      if (!pickedFile) return
      finalValue = pickedFile
    }
    if (!finalValue) return alert('Enter a value!')
    const updatedWorkspaces = workspaces.map((ws) =>
      ws.id === workspaceId ? { ...ws, actions: [...ws.actions, { type, value: finalValue }] } : ws
    )
    setWorkspaces(updatedWorkspaces)
    saveAll(updatedWorkspaces)
    handleInputChange(workspaceId, 'value', '')
  }

  const deleteWorkspace = (workspaceId) => {
    const updatedWorkspaces = workspaces.filter((ws) => ws.id !== workspaceId)
    setWorkspaces(updatedWorkspaces)
    saveAll(updatedWorkspaces)
    setActionInputs((prev) => {
      const newInputs = { ...prev }
      delete newInputs[workspaceId]
      return newInputs
    })
  }

  const deleteAction = (workspaceId, actionIndex) => {
    const updatedWorkspaces = workspaces.map((ws) =>
      ws.id === workspaceId
        ? { ...ws, actions: ws.actions.filter((_, i) => i !== actionIndex) }
        : ws
    )
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
  }

  const getActionIcon = (type) => {
    switch (type) {
      case 'chrome':
        return '🌐'
      case 'vscode':
        return '💻'
      case 'terminal':
        return '⚡'
      case 'file':
        return '📁'
      default:
        return '📝'
    }
  }

  return (
    <div className="min-h-screen bg-base-100" data-theme="synthwave">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-base-content/70">Workspace automation for developers</p>
        </div>

        {/* Create Workspace */}
        <div className="card bg-base-200 shadow-xl mb-6 border border-primary/20">
          <div className="card-body">
            <h2 className="card-title text-primary">⚡ Create New Workspace</h2>
            <div className="flex gap-3">
              <input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Workspace name (e.g., React Project)"
                className="input input-bordered input-primary flex-1"
              />
              <button
                onClick={() => addWorkspace(workspaceName.trim())}
                className="btn btn-primary"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Workspaces */}
        <div className="space-y-6">
          {workspaces.length === 0 && (
            <div className="card bg-base-200 shadow-xl border border-secondary/20 text-center p-6">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-secondary">No workspaces yet</h3>
              <p className="text-base-content/70">Create your first workspace to get started!</p>
            </div>
          )}

          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="card bg-base-200 shadow-xl border border-accent/20 hover:border-accent/40 transition-colors"
            >
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="card-title text-accent text-2xl">💼 {ws.name}</h3>
                  <div className="badge badge-secondary">{ws.actions.length} actions</div>
                </div>

                {/* Add Action */}
                <div className="bg-base-300 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-primary mb-3">Add Action</h4>
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={actionInputs[ws.id]?.type || 'chrome'}
                      onChange={(e) => handleInputChange(ws.id, 'type', e.target.value)}
                      className="select select-bordered select-sm"
                    >
                      <option value="chrome">🌐 Chrome Tab</option>
                      <option value="vscode">💻 VS Code File</option>
                      <option value="terminal">⚡ Terminal</option>
                    </select>
                    <input
                      value={actionInputs[ws.id]?.value || ''}
                      onChange={(e) => handleInputChange(ws.id, 'value', e.target.value)}
                      placeholder="Enter URL or File Path"
                      className="input input-bordered input-sm flex-1 min-w-0"
                    />
                    <button onClick={() => addAction(ws.id)} className="btn btn-success btn-sm">
                      Add
                    </button>
                  </div>
                </div>

                {/* Actions List */}
                {ws.actions.map((action, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between bg-base-100 p-3 rounded-lg border border-base-300 mb-2"
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
                      onClick={() => deleteAction(ws.id, j)}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/20"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Workspace Controls */}
                <div className="flex gap-3 justify-end mt-2">
                  <button onClick={() => startWorkspace(ws)} className="btn btn-primary">
                    ▶ Start
                  </button>
                  <button onClick={() => deleteWorkspace(ws.id)} className="btn btn-error">
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default WorkspaceManager
