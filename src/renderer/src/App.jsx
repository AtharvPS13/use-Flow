import { HashRouter, Route, Routes } from 'react-router-dom'
import Add from './pages/Add'
import Edit from './pages/Edit'
import Home from './pages/Home'

function App() {
  // useEffect(() => {
  //   // Equivalent of your addAndList()
  //   async function testBlocker() {
  //     console.log(await window.appBlocker.add("chromium"));
  //     console.log(await window.appBlocker.list());
  //   }
  //   testBlocker();
  // }, []);

  // const handleOpenApp = () => {
  //   window.electronAPI.openApp("gedit");
  // };
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<Add />} />
        <Route path="/edit" element={<Edit />} />
      </Routes>
    </HashRouter>
  )
}

export default App
