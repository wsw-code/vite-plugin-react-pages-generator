import './App.css'
import { useRoutes } from 'react-router-dom';
import customRoutes from 'react-router-page';











function App() {

  let element = useRoutes(customRoutes);

  return (
    <div className="App">

      {element}

    </div>
  )
}

export default App
