import { AuthenticationProvider } from '../contexts/auth.contexts';
import 'semantic-ui-css/semantic.min.css'
import '../styles/Home.css';
import '../styles/Doctor.css';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  return (
    <AuthenticationProvider>
        <Component {...pageProps} />
    </AuthenticationProvider>
  )
}