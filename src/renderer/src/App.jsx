import { HashRouter, Route, Routes } from 'react-router-dom'
import Add from './pages/Add'
import Edit from './pages/Edit'
import Home from './pages/Home'

function App() {
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
