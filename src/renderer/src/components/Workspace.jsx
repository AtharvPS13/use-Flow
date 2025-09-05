import { useState, useEffect } from "react";

function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    window.electronAPI.loadWorkspaces().then((ws) => {
      if (ws) setWorkspaces(ws);
    });
  }, []);

  const addWorkspace = (name) => {
    if (!name) return alert("Enter a workspace name!");
    setWorkspaces([...workspaces, { name, actions: [] }]);
    saveAll([...workspaces, { name, actions: [] }]);
  };

  const addAction = async (wsIndex, type, value) => {
    if (type === "vscode") {
      const pickedFile = await window.electronAPI.pickFile();
      if (!pickedFile) return;
      value = pickedFile;
    }
    if (!value) return alert("Enter a value!");

    const newWorkspaces = [...workspaces];
    newWorkspaces[wsIndex].actions.push({ type, value });
    setWorkspaces(newWorkspaces);
    saveAll(newWorkspaces);
  };

  const startWorkspace = (ws) => {
    window.electronAPI.startWorkspace(ws);
  };

  const deleteWorkspace = (wsIndex) => {
    const newWorkspaces = workspaces.filter((_, i) => i !== wsIndex);
    setWorkspaces(newWorkspaces);
    saveAll(newWorkspaces);
  };

  const saveAll = (ws) => {
    window.electronAPI.saveWorkspaces(ws);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">useFlow</h1>

      <div className="mb-6 border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Create Workspace</h2>
        <div className="flex gap-2">
          <input
            id="workspaceName"
            placeholder="Workspace Name (e.g. CP)"
            className="border px-3 py-2 rounded w-full"
          />
          <button
            onClick={() => {
              const name = document.getElementById("workspaceName").value.trim();
              addWorkspace(name);
              document.getElementById("workspaceName").value = "";
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {workspaces.map((ws, i) => (
          <div
            key={i}
            className="border p-4 rounded-lg shadow-sm bg-white"
          >
            <h3 className="text-lg font-bold mb-2">{ws.name}</h3>

            <div className="flex gap-2 mb-3">
              <select
                id={`actionType-${i}`}
                className="border px-2 py-2 rounded"
              >
                <option value="chrome">Chrome Tab</option>
                <option value="vscode">VS Code File</option>
                <option value="terminal">Terminal</option>
              </select>
              <input
                id={`actionValue-${i}`}
                placeholder="Enter URL or File Path"
                className="border px-3 py-2 rounded flex-1"
              />
              <button
                onClick={() => {
                  const type = document.getElementById(`actionType-${i}`).value;
                  const value = document.getElementById(`actionValue-${i}`).value.trim();
                  addAction(i, type, value);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add
              </button>
            </div>

            <ul className="list-disc pl-6 mb-3">
              {ws.actions.map((a, j) => (
                <li key={j} className="text-sm text-gray-700">
                  {a.type}: {a.value}
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => startWorkspace(ws)}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                ▶ Start {ws.name}
              </button>
              <button
                onClick={() => deleteWorkspace(i)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                ❌ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkspaceManager;
