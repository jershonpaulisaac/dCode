'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TechStackItem } from '@/lib/types';

// ─── Brand SVG icon registry (viewBox 0 0 24 24 paths, brand bg colours) ──────
const BRAND: Record<string, { bg: string; fg: string; d: string | string[] }> = {
  TypeScript: {
    bg: '#3178c6', fg: '#fff',
    d: 'M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z',
  },
  JavaScript: {
    bg: '#f7df1e', fg: '#000',
    d: 'M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z',
  },
  Python: {
    bg: '#3776ab', fg: '#ffde57',
    d: 'M14.31.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.83l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.23l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05L0 11.97l.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.26-.02.21-.01h5.74l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.26.02-.21V6.07h2.09l.14.01zm-6.47 14.25a.82.82 0 1 0 0 1.64.82.82 0 0 0 0-1.64zm8.72-11.82a.82.82 0 1 0 0 1.64.82.82 0 0 0 0-1.64z',
  },
  'Next.js': {
    bg: '#000', fg: '#fff',
    d: 'M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z',
  },
  'Next.js App Router': {
    bg: '#000', fg: '#fff',
    d: 'M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0z',
  },
  React: {
    bg: '#087ea4', fg: '#fff',
    d: 'M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38a2.167 2.167 0 0 0-1.092-.278z',
  },
  'Tailwind CSS': {
    bg: '#0ea5e9', fg: '#fff',
    d: 'M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zM6.001 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 19.818 9.027 21.2 12.001 21.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z',
  },
  Supabase: {
    bg: '#3ecf8e', fg: '#1a1a2e',
    d: 'M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.33 12.6.636 13.2 1.2 13.2h9.042l.002 9.768c.015.986 1.26 1.41 1.873.637l9.262-11.652c.434-.55.128-1.15-.436-1.15h-9.043L11.9 1.036z',
  },
  PostgreSQL: {
    bg: '#336791', fg: '#fff',
    d: 'M23.5 12a11.5 11.5 0 1 1-23 0 11.5 11.5 0 0 1 23 0zM8.7 7.4c.3-.6.8-1 1.4-1.2.5-.2 1.1-.2 1.6 0 .6.2 1 .6 1.4 1.2.3.5.5 1.1.5 1.7 0 .6-.2 1.2-.5 1.7-.3.5-.8.9-1.3 1.1v1.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-1.5c-.5-.2-1-.6-1.3-1.1-.3-.5-.5-1.1-.5-1.7 0-.6.2-1.2.5-1.7zm1.8-.2c-.4.1-.7.4-.9.8-.2.4-.3.8-.3 1.1 0 .4.1.7.3 1.1.2.4.5.6.9.8.4.1.8.1 1.1 0 .4-.2.7-.4.9-.8.2-.4.3-.7.3-1.1 0-.4-.1-.8-.3-1.1-.2-.4-.5-.7-.9-.8-.3-.1-.7-.1-1.1 0zM15 14h-1v-1h1v1zm-7 0H7v-1h1v1z',
  },
  'Node.js': {
    bg: '#339933', fg: '#fff',
    d: 'M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.197.045.272 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.053-.192-.137-.242l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68C2.99 6.729 2.936 6.825 2.936 6.921v10.15c0 .097.054.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675c-.57-.329-.922-.945-.922-1.604V6.921c0-.659.353-1.275.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.944.924 1.603v10.15c0 .659-.354 1.275-.924 1.604l-8.794 5.078c-.281.163-.601.247-.925.247z',
  },
  Docker: {
    bg: '#2496ed', fg: '#fff',
    d: 'M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.186.186 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z',
  },
  Go: {
    bg: '#00add8', fg: '#fff',
    d: 'M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zm-.047 1.075c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .058.035.035.07l-.093.28c-.023.047-.082.07-.128.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm10.879-2.57c-.614.16-1.034.278-1.638.44l-.331.093c-.468.128-.48.14-.856-.29-.44-.499-.763-.824-1.378-1.113-.925-.44-1.822-.313-2.657.175-.996.582-1.51 1.472-1.498 2.63.012 1.148.804 2.1 1.928 2.257.97.128 1.787-.21 2.43-.933.128-.152.245-.315.396-.513h-2.525c-.35 0-.432-.21-.315-.49.21-.49.596-1.308.82-1.717.047-.094.152-.247.362-.247h5.248c-.023.35-.023.7-.07 1.05-.14 1.495-.618 2.87-1.554 4.07-1.508 1.948-3.494 3.003-5.96 3.26-2.07.222-3.972-.28-5.576-1.635-1.472-1.25-2.31-2.85-2.499-4.776-.21-2.21.49-4.187 1.87-5.9 1.484-1.846 3.411-2.98 5.748-3.342 1.917-.292 3.705.023 5.307 1.12 1.063.714 1.822 1.682 2.31 2.876.093.21.035.327-.21.397z',
  },
  Vue: {
    bg: '#42b883', fg: '#fff',
    d: 'M24 1.61h-9.94L12 5.16 9.94 1.61H0l12 20.78zM12 14.08L5.16 2.23h4.09L12 6.41l2.75-4.18h4.09z',
  },
  MongoDB: {
    bg: '#47a248', fg: '#fff',
    d: 'M17.193 9.555c-1.264-5.58-4.252-7.243-4.932-8.434-.390-.528-.542-1.121-.642-1.121s-.252.593-.643 1.121C10.26 2.312 7.272 3.975 6.007 9.555c-1.265 5.58.504 8.208 2.674 9.913.486.39.92.843 1.32 1.272-.128.83-.244 1.298-.244 1.298s.356-.104.717-.393c.362-.288.71-.593 1.048-.93.337.337.686.642 1.048.93.36.29.717.393.717.393s-.116-.469-.244-1.298c.4-.429.833-.882 1.32-1.272 2.17-1.705 3.939-4.333 2.83-9.913z',
  },
  Prisma: {
    bg: '#2d3748', fg: '#a5f3fc',
    d: 'M21.807 18.285L13.432.75a1.654 1.654 0 0 0-1.473-.904 1.657 1.657 0 0 0-1.54 1.033L2.217 18.175a1.655 1.655 0 0 0 .24 1.727l5.444 6.346a1.655 1.655 0 0 0 2.452.07L22.354 20.02a1.655 1.655 0 0 0 .572-1.319 1.654 1.654 0 0 0-.119-.416zM9.148 22.92l-4.695-5.474 6.345-13.746 8.452 14.834z',
  },
  Redis: {
    bg: '#dc382d', fg: '#fff',
    d: 'M10.9 10.6l2.4-1.2-2.4-1.2-2.4 1.2 2.4 1.2zm8.1 1.5l-5.5-2.2V6.2l5.5 2.3v3.6zm-6.6-2.2L6.9 12.1V8.5l5.5-2.3v3.7zm-6 7.2v-3.6l5.5-2.2v3.7l-5.5 2.1zm5.5 1.4l-5.6-2.1 5.6-2.1 5.5 2.1-5.5 2.1z',
  },
  GraphQL: {
    bg: '#e535ab', fg: '#fff',
    d: 'M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm-.884 4.184l.884-1.53.884 1.53-1.768-.001zm-6.56 9.625l-1.768-.001.884-1.529.884 1.53zm.884 1.53l-.884-1.53h1.768l-.884 1.53zm5.676-9.627l.884-1.529.884 1.53-1.768-.001zm5.676 9.627l-.884-1.53h1.768l-.884 1.53zm.884-1.53l-1.768.001.884-1.53.884 1.529zm-12.352-.884L4.24 12l1.084-1.083 1.085 1.083-1.085 1.083zm13.352 0L17.59 12l1.085-1.083L19.76 12l-1.084 1.083zM12 18.452a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-10.904a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z',
  },
  ESLint: {
    bg: '#4b32c3', fg: '#fff',
    d: 'M7.257 9.132L11.816 6.5a.369.369 0 0 1 .368 0l4.559 2.632a.369.369 0 0 1 .184.32v5.263a.37.37 0 0 1-.184.319l-4.559 2.632a.369.369 0 0 1-.368 0l-4.559-2.632a.369.369 0 0 1-.184-.32V9.452a.37.37 0 0 1 .184-.32M23.852 11.53l-5.446-9.438a.61.61 0 0 0-.527-.305H6.121a.61.61 0 0 0-.527.305L.148 11.53a.61.61 0 0 0 0 .61l5.446 9.438a.61.61 0 0 0 .527.305h11.758a.61.61 0 0 0 .527-.305l5.446-9.439a.61.61 0 0 0 0-.609',
  },
  Vite: {
    bg: '#646cff', fg: '#fff',
    d: 'M12 1.5L1.5 7.5l1.875 1.078L12 4.594l8.625 4.984L22.5 8.5 12 1.5zM1.5 10.5l1.875 1.078v5.86L12 22.5l8.625-5.063v-5.859L22.5 10.5 12 16.5 1.5 10.5zm3.75 2.156L12 16.5l6.75-3.844v2.782L12 19.5l-6.75-3.063V12.656z',
  },
  Sass: {
    bg: '#cc6699', fg: '#fff',
    d: 'M12 0C5.371 0 0 5.371 0 12s5.371 12 12 12 12-5.371 12-12S18.629 0 12 0zm4.54 7.536c-.697.007-1.346.247-1.823.656a17.61 17.61 0 0 0-.247-.524c-.506-1.012-.997-1.823-.997-1.823s.478.017.919.17c.44.152.61.355.61.355s.372-1.13 1.283-1.14c.51-.007.88.34.88.34s-.307.593-.625 1.966zm-5.54 5.464a5.3 5.3 0 0 0-.574.067c-.61.101-1.163.39-1.558.796-.44.455-.635 1.037-.514 1.541.22.9 1.297 1.232 2.115 1.232.7 0 1.449-.22 2.116-.76.667-.54 1.113-1.312 1.258-2.138l.012-.08a4.49 4.49 0 0 0-2.855-.658zm-2.77-3.45c-.04-.023-.08-.046-.12-.066-.618-.32-1.279-.43-1.907-.32-.75.135-1.405.566-1.756 1.16-.47.799-.33 1.772.347 2.363.356.31.81.484 1.287.484.271 0 .55-.054.82-.167a3.44 3.44 0 0 0 1.524-1.327c.04-.065.077-.13.114-.197l.037-.072a3.84 3.84 0 0 0-.346-1.858z',
  },
  Express: {
    bg: '#404040', fg: '#fff',
    d: 'M24 18.588a1.529 1.529 0 0 1-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 0 1-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 0 1 1.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 0 1 1.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 0 0 0 .994l4.804 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19.009 7.92 17.7a4.078 4.078 0 0 0 2.582-2.876c.207-.666.548-.78 1.174-.588a5.417 5.417 0 0 1-2.589 3.957 6.272 6.272 0 0 1-7.306-.933 6.575 6.575 0 0 1-1.64-3.858c0-.235-.08-.455-.138-.825zm1.134-.228h8.222c-.035-2.558-1.642-4.073-3.903-3.96-2.406.12-4.258 1.766-4.319 3.96z',
  },
  Flask: {
    bg: '#000', fg: '#fff',
    d: 'M11.5 0c.65 0 1.19.47 1.28 1.1l.02.15V9l4.97 9.07c.57 1.04.21 2.35-.83 2.92-.49.27-1.04.32-1.56.16l-.18-.07-4.2-1.9-4.2 1.9c-.49.22-1.04.25-1.55.08l-.2-.08a2.14 2.14 0 0 1-.83-2.92L9.2 9V1.25C9.2.56 9.76 0 10.44 0h1.06z',
  },
  Django: {
    bg: '#092e20', fg: '#44b78b',
    d: 'M11.5 0h1c.83 0 1.5.67 1.5 1.5v21c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-21C10 .67 10.67 0 11.5 0zm-5 5h1c.83 0 1.5.67 1.5 1.5v10.94c0 2.5-2.04 4.56-4.56 4.56H3c-.55 0-1-.45-1-1s.45-1 1-1h.44C4.85 20 6 18.85 6 17.44V6.5C6 5.67 6.67 5 7.5 5H6.5zM17 5h1c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-9C15.5 5.67 16.17 5 17 5z',
  },
  FastAPI: {
    bg: '#009688', fg: '#fff',
    d: 'M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm-.624 21.624v-7.248H6.48L13.104 2.4v7.248h4.896l-6.624 11.976z',
  },
  Rust: {
    bg: '#ce412b', fg: '#fff',
    d: 'M23.634 11.536l-1.04-.645a13.44 13.44 0 0 0-.028-.292l.9-.79a.371.371 0 0 0-.108-.613l-1.124-.437a12.93 12.93 0 0 0-.086-.284l.74-.92a.372.372 0 0 0-.206-.588l-1.18-.22a13.65 13.65 0 0 0-.143-.262l.561-1.033a.372.372 0 0 0-.3-.548l-1.197.004a13.97 13.97 0 0 0-.196-.232l.367-1.118a.371.371 0 0 0-.384-.49l-1.178.226a14.07 14.07 0 0 0-.243-.194l.158-1.163a.371.371 0 0 0-.455-.414l-1.116.443a13.4 13.4 0 0 0-.28-.148L17.2.831a.371.371 0 0 0-.509-.322l-1.008.652a12.98 12.98 0 0 0-.308-.1L15.18.045a.371.371 0 0 0-.548-.183l-.87.844a13.23 13.23 0 0 0-.322-.05L13.246.007a.371.371 0 0 0-.573-.034l-.718 1.02a13.25 13.25 0 0 0-.326.001L11 .01a.371.371 0 0 0-.568.05l-.555 1.095a13.23 13.23 0 0 0-.32.054L8.73.362a.371.371 0 0 0-.543.194l-.376 1.198a12.98 12.98 0 0 0-.306.103L6.49.556a.371.371 0 0 0-.506.327l-.185 1.236a14.07 14.07 0 0 0-.279.15L4.396.842a.371.371 0 0 0-.452.42l.012 1.246a13.4 13.4 0 0 0-.254.196L2.572 2.26a.371.371 0 0 0-.38.496l.207 1.218a14.07 14.07 0 0 0-.222.239l-1.208.157a.371.371 0 0 0-.296.555l.4 1.165a13.65 13.65 0 0 0-.185.278l-1.189.43a.371.371 0 0 0-.202.593l.59.987a12.93 12.93 0 0 0-.143.31L.03 9.37a.371.371 0 0 0-.1.619l.77.855a12.53 12.53 0 0 0-.1.325l-1.02.679a.371.371 0 0 0 .003.624l.924.72a12.13 12.13 0 0 0-.055.337L.305 14.4a.371.371 0 0 0 .103.617l1.053.56a11.7 11.7 0 0 0-.009.347l-1.063.82a.371.371 0 0 0 .208.64l1.148.39v.348l-1.093.962a.371.371 0 0 0 .311.643l1.208.214.054.338-1.094 1.094a.371.371 0 0 0 .412.601l1.236.034.106.32-1.064 1.22a.371.371 0 0 0 .507.548l1.23-.147.155.296-1.005 1.333a.371.371 0 0 0 .593.468l1.186-.325.199.265-.918 1.43a.371.371 0 0 0 .668.38l1.11-.494.237.23-.805 1.51a.371.371 0 0 0 .729.286l1.007-.65.268.189-.671 1.574a.371.371 0 0 0 .778.18l.878-.797.294.143-.518 1.626a.371.371 0 0 0 .817.068l.727-.934.315.094-.35 1.66a.371.371 0 0 0 .842-.048l.56-1.059.33.042-.175 1.679a.371.371 0 0 0 .856-.156l.381-1.175.34-.01 0 1.68a.371.371 0 0 0 .855.156l.194-1.664.34.01.195 1.672a.371.371 0 0 0 .853-.163l-.003-1.682.33-.042.385 1.168a.371.371 0 0 0 .842-.048l-.177-1.68.315-.094.564 1.056a.371.371 0 0 0 .816-.069l-.352-1.657.294-.143.73.931a.371.371 0 0 0 .817-.068l-.52-1.625.268-.189 1.01.648a.371.371 0 0 0 .728-.286l-.674-1.572.237-.23 1.112.492a.371.371 0 0 0 .592-.468l-.807-1.508.199-.265 1.187.323a.371.371 0 0 0 .507-.548l-.938-1.336.155-.296 1.232.145a.371.371 0 0 0 .412-.601l-1.066-1.093.106-.32 1.238-.034a.371.371 0 0 0 .31-.643l-1.096-.962v-.348l1.15-.39a.371.371 0 0 0 .207-.64zm-11.636 7.083a6.454 6.454 0 1 1 0-12.908 6.454 6.454 0 0 1 0 12.908zm7.617-8.98a.38.38 0 1 1-.001-.759.38.38 0 0 1 0 .76zm-1.3 2.455a.38.38 0 1 1-.001-.759.38.38 0 0 1 0 .76zM8.342 4.76a.38.38 0 1 1-.001-.759.38.38 0 0 1 0 .76z',
  },
  Java: {
    bg: '#007396', fg: '#fff',
    d: 'M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639',
  },
  Kotlin: {
    bg: '#7f52ff', fg: '#fff',
    d: 'M1.3 24L12 12.4 1.3 0H12l10.7 12.4L12 24z',
  },
  Swift: {
    bg: '#f05138', fg: '#fff',
    d: 'M23.998 12c0-6.628-5.372-12-11.999-12C5.372 0 0 5.372 0 12s5.372 12 11.999 12c6.627 0 11.999-5.372 11.999-12zm-7.595-4.522c.433.785.648 1.668.599 2.564-.048.895-.364 1.756-.912 2.463-.066-.404-.199-.794-.396-1.154-.198-.36-.454-.684-.757-.952l-2.19-1.94c.49.975.702 2.064.618 3.148-.047.566-.19 1.12-.421 1.638L8.2 9.58c.49.975.703 2.064.618 3.148-.098 1.289-.655 2.504-1.578 3.42a5.75 5.75 0 0 1-1.67 1.14c.45-.743.69-1.597.692-2.468 0-.87-.238-1.724-.687-2.467L3.667 10.17a7.54 7.54 0 0 0-.74-1.08c-.292-.367-.633-.691-1.015-.962.117.517.152 1.049.105 1.576-.086.993-.43 1.944-.999 2.75-.568.808-1.34 1.444-2.23 1.842.276-1.018.276-2.1 0-3.118a5.26 5.26 0 0 0-1.29-2.262 5.38 5.38 0 0 0-2.198-1.371 5.42 5.42 0 0 0-2.56-.19c.617-.627 1.38-1.084 2.218-1.33a5.48 5.48 0 0 1 2.583-.15c.886.17 1.71.58 2.38 1.185l2.08 1.975c-.491-.975-.703-2.064-.619-3.148.097-1.29.655-2.505 1.578-3.42.463-.457 1.008-.82 1.608-1.065a5.48 5.48 0 0 1 1.877-.341z',
  },
  PHP: {
    bg: '#777bb4', fg: '#fff',
    d: 'M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.174-.193-.51-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.39 2.006H3.612l1.113-5.734h2.468c.76 0 1.338.158 1.73.475.39.317.527.82.41 1.506a2.5 2.5 0 0 1-.593 1.032zm4.1 2.28h-1.344l.139-.72c-.238.25-.5.444-.782.578a2.42 2.42 0 0 1-.998.196 1.44 1.44 0 0 1-1.107-.453c-.28-.302-.368-.716-.264-1.236l.555-2.86h1.344l-.522 2.687c-.043.223-.017.398.076.524.093.126.238.19.436.19.267 0 .506-.088.714-.264.209-.176.35-.435.424-.776l.476-2.361h1.342l-.489 2.495zm3.981-.891c-.097.5-.297.892-.6 1.178-.302.286-.694.43-1.176.43a1.19 1.19 0 0 1-.956-.418l-.135.697h-1.343l1.113-5.734h1.342l-.367 1.892c.2-.219.416-.386.647-.499.23-.113.483-.17.757-.17.475 0 .834.17 1.078.508.244.34.311.826.2 1.46l-.562 2.656z',
  },
  Ruby: {
    bg: '#cc342d', fg: '#fff',
    d: 'M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 7.94 23.983l-7.94.017L1.5 13.487l14.295-1.6-1.5-6.9L.093 6.248.19 3.202 20.156.083z',
  },
};

// ─── Category accent colours ──────────────────────────────────────────────────
const CAT_COLOR: Record<TechStackItem['category'], string> = {
  language:  '#60a5fa',
  framework: '#a78bfa',
  database:  '#34d399',
  tooling:   '#fbbf24',
  runtime:   '#22d3ee',
  library:   '#f97316',
};

const CAT_LABEL: Record<TechStackItem['category'], string> = {
  language:  'Language',
  framework: 'Framework',
  database:  'Database',
  tooling:   'Tooling',
  runtime:   'Runtime',
  library:   'Library',
};

// ─── Dependency edge rules (category-to-category) ────────────────────────────
const DEP_RULES: [TechStackItem['category'], TechStackItem['category']][] = [
  ['language',  'framework'],
  ['language',  'runtime'],
  ['framework', 'database'],
  ['framework', 'tooling'],
  ['runtime',   'database'],
  ['library',   'framework'],
  ['tooling',   'framework'],
  ['language',  'library'],
];

// ─── Node / edge data types ───────────────────────────────────────────────────
interface NodeData {
  id: string;
  item: TechStackItem;
  x: number;
  y: number;
  fileCount: number;
  usagePct: number;
}
interface EdgeData { from: string; to: string }

// ─── Layout: category rings, no central hub ───────────────────────────────────
function buildLayout(techStack: TechStackItem[], W: number, H: number) {
  if (techStack.length === 0) return { nodes: [], edges: [] };

  const grouped: Partial<Record<TechStackItem['category'], TechStackItem[]>> = {};
  for (const t of techStack) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category]!.push(t);
  }

  const totalFiles = techStack.reduce((s, t) => s + (t.fileCount ?? 1), 0) || 1;
  const nodes: NodeData[] = [];
  const categories = Object.keys(grouped) as TechStackItem['category'][];
  const catCount = categories.length;
  const ringR = Math.min(W, H) * (catCount <= 3 ? 0.28 : 0.34);
  const catAngleStep = (2 * Math.PI) / catCount;
  const cx = W / 2;
  const cy = H / 2;

  categories.forEach((cat, ci) => {
    const items = grouped[cat]!;
    const catAngle = ci * catAngleStep - Math.PI / 2;
    const catX = cx + ringR * Math.cos(catAngle);
    const catY = cy + ringR * Math.sin(catAngle);
    const leafR = Math.min(W, H) * (items.length > 2 ? 0.13 : 0.09);

    items.forEach((item, ii) => {
      const spread = items.length > 1
        ? ((ii - (items.length - 1) / 2) * Math.PI) / Math.max(items.length * 1.6, 2)
        : 0;
      const angle = catAngle + spread;
      const fc = item.fileCount ?? Math.max(1, 2 + ii * 2 + (cat === 'language' ? 5 : 1));
      const pct = item.usagePct ?? Math.min(99, Math.round((fc / totalFiles) * 100 * 3));
      nodes.push({
        id: item.name,
        item,
        x: catX + leafR * Math.cos(angle),
        y: catY + leafR * Math.sin(angle),
        fileCount: fc,
        usagePct: pct,
      });
    });
  });

  // Clamp all nodes within canvas bounds
  const PAD = 34;
  for (const n of nodes) {
    n.x = Math.min(Math.max(n.x, PAD), W - PAD);
    n.y = Math.min(Math.max(n.y, PAD), H - PAD);
  }

  // Build edges from dep rules between present categories
  const edges: EdgeData[] = [];
  const seen = new Set<string>();
  for (const [fc, tc] of DEP_RULES) {
    const fromNode = grouped[fc]?.[0];
    const toNode = grouped[tc]?.[0];
    if (!fromNode || !toNode) continue;
    const key = `${fromNode.name}→${toNode.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      edges.push({ from: fromNode.name, to: toNode.name });
    }
  }
  return { nodes, edges };
}

// ─── Animated dashed arc edge with arrowhead ──────────────────────────────────
function Edge({ x1, y1, x2, y2, color, active }: {
  x1: number; y1: number; x2: number; y2: number; color: string; active: boolean;
}) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // Slight quadratic bezier curve
  const mx = x1 + dx * 0.5 - (dy / len) * len * 0.07;
  const my = y1 + dy * 0.5 + (dx / len) * len * 0.07;
  const path = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
  // Arrowhead near target
  const ux = (x2 - mx), uy = (y2 - my);
  const ul = Math.hypot(ux, uy) || 1;
  const aw = 5.5;
  const ax = x2 - (ux / ul) * aw * 1.4;
  const ay = y2 - (uy / ul) * aw * 1.4;
  const pts = [
    `${x2},${y2}`,
    `${ax - (uy / ul) * aw * 0.5},${ay + (ux / ul) * aw * 0.5}`,
    `${ax + (uy / ul) * aw * 0.5},${ay - (ux / ul) * aw * 0.5}`,
  ].join(' ');

  return (
    <g style={{ pointerEvents: 'none' }}>
      <path d={path} fill="none"
        stroke={active ? color : '#1e293b'}
        strokeWidth={active ? 1.5 : 0.7}
        strokeDasharray="5 4"
        opacity={active ? 0.65 : 0.18}
        style={{ transition: 'stroke 0.25s, opacity 0.25s' }}
      >
        {active && (
          <animate attributeName="stroke-dashoffset" from="0" to="-18"
            dur="0.85s" repeatCount="indefinite" />
        )}
      </path>
      {active && <polygon points={pts} fill={color} opacity={0.75} />}
    </g>
  );
}

// ─── Brand logo node ─────────────────────────────────────────────────────────
function LogoNode({ node, isHovered, isRelated, onHover }: {
  node: NodeData;
  isHovered: boolean;
  isRelated: boolean;
  onHover: (id: string | null) => void;
}) {
  const catColor = CAT_COLOR[node.item.category];
  const brand = BRAND[node.item.name];
  const R = 26;
  const opacity = isHovered ? 1 : isRelated ? 0.85 : 0.38;

  // Normalise d to always be a string for SVG <path>
  const pathD = brand
    ? (Array.isArray(brand.d) ? brand.d.join(' ') : brand.d)
    : null;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Radial glow on hover */}
      {isHovered && (
        <circle cx={node.x} cy={node.y} r={R + 14}
          fill={catColor} opacity={0.14}
          style={{ filter: 'blur(8px)' }} />
      )}
      {/* Outer pulse ring */}
      {isHovered && (
        <circle cx={node.x} cy={node.y} r={R + 4}
          fill="none" stroke={catColor} strokeWidth={1.5} opacity={0.45}
          style={{ transition: 'all 0.2s ease' }} />
      )}

      {/* Main circle — brand bg colour, no border at rest */}
      <circle
        cx={node.x} cy={node.y} r={R}
        fill={brand?.bg ?? '#1e293b'}
        stroke={isHovered ? catColor : 'rgba(255,255,255,0.06)'}
        strokeWidth={isHovered ? 2 : 1}
        style={{ transition: 'stroke 0.2s' }}
      />

      {/* Official brand SVG logo */}
      {pathD ? (
        <g transform={`translate(${node.x - 12}, ${node.y - 12})`}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d={pathD} fill={brand!.fg} />
          </svg>
        </g>
      ) : (
        // Fallback: monogram initials — only when no brand path exists
        <text x={node.x} y={node.y + 1}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontWeight="700"
          fill={catColor} fontFamily="monospace"
          style={{ userSelect: 'none' }}
        >
          {node.item.name.slice(0, 3).toUpperCase()}
        </text>
      )}

      {/* Category dot badge */}
      <circle
        cx={node.x + R * 0.71} cy={node.y - R * 0.71}
        r={5} fill={catColor} stroke="#020617" strokeWidth={1.5}
      />
    </motion.g>
  );
}

// ─── Glassmorphism tooltip ────────────────────────────────────────────────────
function Tooltip({ node, svgRect, svgW, svgH }: {
  node: NodeData; svgRect: DOMRect | null; svgW: number; svgH: number;
}) {
  if (!svgRect) return null;
  const catColor = CAT_COLOR[node.item.category];
  const scaleX = svgRect.width / svgW;
  const scaleY = svgRect.height / svgH;
  const domX = node.x * scaleX + svgRect.left;
  const domY = node.y * scaleY + svgRect.top;
  const TW = 218;
  const left = Math.min(Math.max(domX - TW / 2, 6), window.innerWidth - TW - 6);
  const top = domY < svgRect.top + svgRect.height * 0.55 ? domY + 38 : domY - 108;

  const usagePct = node.usagePct;
  const fileCount = node.fileCount;
  const version = node.item.version;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.94 }}
      transition={{ duration: 0.13 }}
      className="pointer-events-none fixed z-50 rounded-2xl"
      style={{
        left, top, width: TW,
        background: 'rgba(2,6,23,0.82)',
        border: `1px solid ${catColor}30`,
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 16px 32px rgba(0,0,0,0.55), 0 0 24px ${catColor}18`,
        padding: '11px 13px 10px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[12px] font-semibold text-slate-100 leading-none">
          {node.item.name}
          {version && <span className="ml-1 text-[9px] text-slate-500 font-normal">v{version}</span>}
        </span>
        <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest leading-none"
          style={{ background: catColor + '20', color: catColor, border: `1px solid ${catColor}35` }}>
          {CAT_LABEL[node.item.category]}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        <div className="rounded-xl px-2.5 py-2 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-mono text-[13px] font-bold text-slate-100 leading-none">{usagePct}%</p>
          <p className="text-[9px] text-slate-500 mt-0.5">Usage</p>
        </div>
        <div className="rounded-xl px-2.5 py-2 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-mono text-[13px] font-bold text-slate-100 leading-none">{fileCount}</p>
          <p className="text-[9px] text-slate-500 mt-0.5">Files</p>
        </div>
      </div>

      {/* Usage bar */}
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(usagePct, 100)}%`, background: `linear-gradient(90deg, ${catColor}cc, ${catColor})` }} />
      </div>
    </motion.div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 text-4xl opacity-20">◎</div>
      <p className="text-sm text-slate-500">No technologies detected in the analysed repository.</p>
    </div>
  );
}

// ─── Main exported component ─────────────────────────────────────────────────
export function TechStackGraph({ techStack }: { techStack: TechStackItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 720, h: 420 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [svgRect, setSvgRect] = useState<DOMRect | null>(null);
  const [activeCategory, setActiveCategory] = useState<TechStackItem['category'] | null>(null);

  // Responsive container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.clientWidth || 720;
      setDims({ w, h: Math.min(Math.max(w * 0.6, 300), 540) });
    };
    const obs = new ResizeObserver(calc);
    obs.observe(el);
    calc();
    return () => obs.disconnect();
  }, []);

  const updateRect = useCallback(() => {
    setSvgRect(svgRef.current?.getBoundingClientRect() ?? null);
  }, []);

  if (techStack.length === 0) return <EmptyState />;

  const { nodes, edges } = buildLayout(techStack, dims.w, dims.h);

  // Unique categories present in this analysis only
  const seen = new Set<TechStackItem['category']>();
  const categories: TechStackItem['category'][] = [];
  for (const t of techStack) {
    if (!seen.has(t.category)) { seen.add(t.category); categories.push(t.category); }
  }

  const relatedIds = hovered
    ? new Set([hovered, ...edges.filter(e => e.from === hovered || e.to === hovered).flatMap(e => [e.from, e.to])])
    : null;

  const isVisible = (n: NodeData) => !activeCategory || n.item.category === activeCategory;
  const isHigh = (n: NodeData) => !hovered
    ? isVisible(n)
    : (relatedIds?.has(n.id) ?? false) && isVisible(n);

  const hoveredNode = hovered ? (nodes.find(n => n.id === hovered) ?? null) : null;

  return (
    <div ref={containerRef} className="relative w-full select-none">

      {/* ── Category filter chips ─── */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory(null)}
          className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200"
          style={{
            borderColor: activeCategory === null ? '#475569' : '#1e293b',
            background: activeCategory === null ? '#1e293b' : 'transparent',
            color: activeCategory === null ? '#e2e8f0' : '#475569',
          }}
        >All</button>

        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const color = CAT_COLOR[cat];
          return (
            <button key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200"
              style={{
                borderColor: isActive ? color + '55' : '#1e293b',
                background: isActive ? color + '15' : 'transparent',
                color: isActive ? color : '#475569',
              }}
            >
              {CAT_LABEL[cat]}
              <span className="ml-1 opacity-50">
                {techStack.filter(t => t.category === cat).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── SVG canvas ─── */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ height: dims.h, background: 'radial-gradient(ellipse at 50% 45%, rgba(30,41,59,0.55) 0%, rgba(2,6,23,0.0) 70%)' }}>
        <svg
          ref={svgRef}
          width={dims.w}
          height={dims.h}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          className="w-full"
          onMouseMove={updateRect}
        >
          {/* Subtle grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={dims.w} height={dims.h} fill="url(#grid)" />

          {/* Edges */}
          {edges.map((edge, i) => {
            const fn = nodes.find(n => n.id === edge.from);
            const tn = nodes.find(n => n.id === edge.to);
            if (!fn || !tn || !isVisible(fn) || !isVisible(tn)) return null;
            const active = !hovered || edge.from === hovered || edge.to === hovered;
            const color = CAT_COLOR[fn.item.category];
            return (
              <Edge key={i}
                x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                color={color} active={active}
              />
            );
          })}

          {/* Nodes */}
          {nodes.filter(isVisible).map(node => (
            <LogoNode key={node.id} node={node}
              isHovered={hovered === node.id}
              isRelated={isHigh(node)}
              onHover={id => { setHovered(id); if (id) updateRect(); }}
            />
          ))}
        </svg>
      </div>

      {/* ── Tooltip (portal-like fixed positioning) ─── */}
      <AnimatePresence>
        {hoveredNode && (
          <Tooltip key="tt"
            node={hoveredNode}
            svgRect={svgRect}
            svgW={dims.w}
            svgH={dims.h}
          />
        )}
      </AnimatePresence>

      {/* ── Legend ─── */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {categories.map(cat => {
          const c = CAT_COLOR[cat];
          const count = techStack.filter(t => t.category === cat).length;
          return (
            <div key={cat} className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: c }} />
              <span className="text-[10px] text-slate-500">
                {CAT_LABEL[cat]}{' '}
                <span className="text-slate-700">({count})</span>
              </span>
            </div>
          );
        })}
        <span className="ml-auto text-[10px] text-slate-700">hover to inspect</span>
      </div>
    </div>
  );
}
