import './App.css'
import { useRoutes } from 'react-router-dom';
import customRoutes from 'react-router-page';

function App() {

  // console.log(customRoutes)

  let element = useRoutes(customRoutes);

  return (
    <div className="App">
      {/* 111 */}
      {element}
    </div>
  )
}

export default App
