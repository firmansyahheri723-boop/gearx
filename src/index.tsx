import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { createRouter } from './router';

const router = createRouter();

const root = document.getElementById('root');
if (root) render(() => <Router>{router}</Router>, root);
