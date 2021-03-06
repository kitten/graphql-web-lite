import { render } from 'preact';
import { Provider, createClient } from '@urql/preact';
import Pokemons from './Pokemons';

const client = createClient({
  url: 'https://trygql.formidable.dev/graphql/basic-pokedex',
});

render(
  <React.StrictMode>
    <Provider value={client}>
      <Pokemons />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
