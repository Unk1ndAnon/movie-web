import { SearchView } from './views/Search';
import { MovieView } from './views/Movie';
import { useMovie, MovieProvider } from './hooks/useMovie';
import {
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import './index.css';

function MovieMatch() {
  return (
    <div>
      <Route exact path="/">
        <SearchView />
      </Route>
      <Route exact path="/:source/:title/:slug/season/:season/episode/:episode" >
        <MovieView />
      </Route>
      <Route exact path="/:source/:title/:slug">
        <MovieView />
      </Route>
    </div>
  )
}

function Router() {
  const { streamData } = useMovie();

  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/movie" />
      </Route>
      <Route path="/movie">
        <MovieMatch />
      </Route>
      <Route path="/show">
        <MovieMatch />
      </Route>
      <Route path="*">
        <p>Page not found</p>
      </Route>
    </Switch>
  )
}

function App() {
  return (
    <MovieProvider>
      <Router/>
    </MovieProvider>
  );
}

export default App;
