'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TechStackItem } from '@/lib/types';
import { useTheme } from '@/lib/theme-context';

// ─── Brand SVG paths (inline, no external deps) ───────────────────────────────
// Each entry: { bg, fg, path } where path is the SVG viewBox="0 0 24 24" path data
const BRAND_ICONS: Record<string, { bg: string; fg: string; d: string }> = {
  'TypeScript': {
    bg: '#3178c6', fg: '#fff',
    d: 'M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z',
  },
  'JavaScript': {
    bg: '#f7df1e', fg: '#000',
    d: 'M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z',
  },
  'Python': {
    bg: '#3776ab', fg: '#fff',
    d: 'M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05L0 11.97l.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.26-.02.21-.01h5.74l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.26.02-.21V6.07h2.09l.14.01zm-6.47 14.25ad.82 0 1.5.66 1.5 1.5 0 .82-.68 1.5-1.5 1.5-.83 0-1.5-.68-1.5-1.5 0-.82.67-1.5 1.5-1.5zm8.72-11.82l-.82 0-1.5.68-1.5 1.5 0 .82.68 1.5 1.5 1.5.82 0 1.5-.68 1.5-1.5 0-.82-.68-1.5-1.5-1.5z',
  },
  'Next.js App Router': {
    bg: '#000', fg: '#fff',
    d: 'M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z',
  },
  'Next.js': {
    bg: '#000', fg: '#fff',
    d: 'M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0z',
  },
  'React': {
    bg: '#087ea4', fg: '#fff',
    d: 'M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38a2.167 2.167 0 0 0-1.092-.278zm-.005 1.09c.186 0 .36.048.51.137 1.039.6 1.304 2.909.676 5.842-1.04-.243-2.18-.418-3.376-.512a24.303 24.303 0 0 0-2.228-2.868c1.554-1.58 3.054-2.6 4.418-2.6zm-9.343.38c1.375 0 2.865 1.012 4.408 2.582a24.03 24.03 0 0 0-2.216 2.863 24.14 24.14 0 0 0-3.385.523c-.647-2.94-.386-5.254.658-5.853.145-.085.32-.116.535-.116zm7.996 5.04a24.28 24.28 0 0 1 1.053 1.977 24.34 24.34 0 0 1-1.055 1.971 24.28 24.28 0 0 1-1.052-1.973 24.322 24.322 0 0 1 1.054-1.975zm-5.938.003c.34.664.685 1.318 1.052 1.972-.367.654-.71 1.306-1.052 1.973a24.19 24.19 0 0 1-1.049-1.975c.339-.661.685-1.316 1.05-1.97zm-2.975.57c.61.216 1.256.41 1.93.573a23.68 23.68 0 0 0-.926 2.186 23.8 23.8 0 0 0-1.737-.747c-.607-.234-1.178-.494-1.707-.762.486-.24 1.057-.488 1.694-.732.254-.093.507-.186.746-.518zm11.913.003c.237.084.482.173.738.272a22.68 22.68 0 0 1 1.692.737c-.528.266-1.094.525-1.7.757-.607.233-1.24.427-1.875.605a24.025 24.025 0 0 0-.922-2.18c.606-.166 1.25-.357 2.067-.191zm-5.913 4.13c.663.364 1.32.692 1.975.99a23.64 23.64 0 0 1-1.97.99 24.08 24.08 0 0 1-1.971-.99c.657-.3 1.316-.628 1.966-.99zm-2.6.5c.606.166 1.252.357 1.9.53a23.65 23.65 0 0 0 1.84 2.86c-1.553 1.58-3.052 2.601-4.415 2.601-.217 0-.39-.032-.54-.116-1.04-.6-1.302-2.91-.676-5.842.61.215 1.265.411 1.89.967z',
  },
  'Tailwind CSS': {
    bg: '#0ea5e9', fg: '#fff',
    d: 'M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z',
  },
  'Supabase': {
    bg: '#3ecf8e', fg: '#fff',
    d: 'M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.33 12.6.636 13.2 1.2 13.2h9.042l.002 9.768c.015.986 1.26 1.41 1.873.637l9.262-11.652c.434-.55.128-1.15-.436-1.15h-9.043L11.9 1.036z',
  },
  'PostgreSQL': {
    bg: '#336791', fg: '#fff',
    d: 'M13.212 1.534c-.783-.19-1.585-.073-2.286.33a4.96 4.96 0 0 0-.68.479c-.274.23-.524.485-.745.762A6.37 6.37 0 0 0 8.32 5.26a7.42 7.42 0 0 0-.409 2.408c0 .59.07 1.176.207 1.74.045.18.095.36.152.54-.293.073-.585.155-.875.242-.52.156-1.035.337-1.538.543-.327.133-.648.28-.96.44a6.31 6.31 0 0 0-.86.568 3.856 3.856 0 0 0-.65.72 2.77 2.77 0 0 0-.4.93 2.39 2.39 0 0 0 .047 1.13c.11.34.285.655.51.93.24.29.517.545.82.758.32.22.657.41 1.006.566.718.318 1.47.547 2.234.72.763.172 1.538.278 2.31.337.773.059 1.536.062 2.3.008.763-.053 1.526-.166 2.276-.358.75-.19 1.487-.457 2.163-.832.676-.374 1.29-.88 1.745-1.56.454-.68.644-1.55.44-2.44a3.75 3.75 0 0 0-.384-.95 4.93 4.93 0 0 0-.597-.79 6.27 6.27 0 0 0-.77-.651 8.16 8.16 0 0 0-.884-.52c-.3-.156-.607-.294-.918-.42a16.65 16.65 0 0 0-.933-.317 10.9 10.9 0 0 0-.453-.12c.138-.495.226-1.002.265-1.512.04-.51.023-1.023-.054-1.527A5.18 5.18 0 0 0 14.89 3.35a4.3 4.3 0 0 0-.758-.952 3.716 3.716 0 0 0-.92-.864z',
  },
  'Node.js': {
    bg: '#339933', fg: '#fff',
    d: 'M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082 c0.57,0.329,0.924,0.944,0.924,1.603v10.15c0,0.659-0.354,1.275-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z',
  },
  'Docker': {
    bg: '#2496ed', fg: '#fff',
    d: 'M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.186.186 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z',
  },
  'Go': {
    bg: '#00add8', fg: '#fff',
    d: 'M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .058.035.035.07l-.093.28c-.023.047-.082.07-.128.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.771.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.966.596-1.274a.315.315 0 0 1 .292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 0 1-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2zm3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 0 1-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.644.083-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788 1.052-1.895 2.15-.09.964.467 1.972 1.38 2.28.77.257 1.52.152 2.15-.432.482-.454.722-1.028.784-2.057z',
  },
  'MongoDB': {
    bg: '#47a248', fg: '#fff',
    d: 'M17.193 9.555c-1.264-5.58-4.252-7.243-4.pickup-7.602C12.32 1.73 12.09 1.208 12 0a49 49 0 0 0-.312 1.954C11.31 4.076 9.21 5.524 8.016 8.08c-1.138 2.426-1.076 5.497.304 7.855C9.614 18.098 12 18.803 12 18.803s-.03.065-.066.185C11.726 19.77 11.13 20 11.13 20s-2.01-.93-3.282-2.94C6.12 14.38 5.803 11.247 7.133 8.616c1.376-2.63 3.27-3.94 3.27-3.94s-.032 1.547-.04 2.38C10.32 8.33 9.4 9.28 9.4 11.115c0 1.843 1.14 3.312 2.844 3.312.217 0 .427-.022.627-.063L12 14.37l-.13.018c-1.36.286-2.454-.95-2.454-2.4 0-1.448 1.093-2.53 1.867-2.963.22-.12.31-.29.28-.47-.003-.02-.004-.04-.004-.06V4.555z',
  },
  'Prisma': {
    bg: '#2d3748', fg: '#fff',
    d: 'M21.8074 18.2228L13.4319.756a1.6544 1.6544 0 0 0-1.4736-.9039 1.6556 1.6556 0 0 0-1.5396 1.0322L2.2169 18.1756a1.655 1.655 0 0 0 .2405 1.7265l5.4438 6.3465a1.6548 1.6548 0 0 0 2.4517.0697l12.0019-12.0019a1.655 1.655 0 0 0 .5718-1.3193 1.6553 1.6553 0 0 0-.1192-.7743zM9.1484 22.9208l-4.695-5.4746 6.3456-13.746L19.25 17.988z',
  },
  'Redis': {
    bg: '#dc382d', fg: '#fff',
    d: 'M10.9 10.6l2.4-1L10.9 8.4l-2.4 1.2 2.4 1zm8.1 1.5l-5.5-2.2V6.2l5.5 2.3v3.6zm-6.6-2.2l-5.5 2.2V8.5l5.5-2.3v3.7zm-6 7.2V13.5l5.5-2.2v3.7l-5.5 2.1zM7 21.5l.1-.1.3-.1.5-.2.7-.3.9-.4 1.1-.5 1.4-.6 1.6-.7-1.6-.7-1.4-.6-1.1-.5-.9-.4-.7-.3-.5-.2-.3-.1-.1-.1.1-.1.3-.1.5-.2.7-.3.9-.4 1.1-.5 1.4-.6 1.6-.7c5.9-2.6 8.3-3.7 8.3-3.7v6.6c0 .1-.1.2-.2.2l-7.9 3.5c-.3.1-.5.1-.8.1s-.5 0-.8-.1L2.2 16.5c-.1 0-.2-.1-.2-.2v-6.7s2.4 1.1 8.3 3.7l1.6.7-1.6.7-1.4.6-1.1.5-.9.4-.7.3-.5.2-.3.1-.1.1 1.6.7-1.6.7z',
  },
  'Tailwind': {
    bg: '#0ea5e9', fg: '#fff',
    d: 'M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z',
  },
  'Vue': {
    bg: '#42b883', fg: '#fff',
    d: 'M24 1.61h-9.94L12 5.16 9.94 1.61H0l12 20.78zM12 14.08L5.16 2.23h4.09L12 6.41l2.75-4.18h4.09z',
  },
  'ESLint': {
    bg: '#4b32c3', fg: '#fff',
    d: 'M7.257 9.132L11.816 6.5a.369.369 0 0 1 .368 0l4.559 2.632a.369.369 0 0 1 .184.32v5.263a.37.37 0 0 1-.184.319l-4.559 2.632a.369.369 0 0 1-.368 0l-4.559-2.632a.369.369 0 0 1-.184-.32V9.452a.37.37 0 0 1 .184-.32M23.852 11.53l-5.446-9.438a.61.61 0 0 0-.527-.305H6.121a.61.61 0 0 0-.527.305L.148 11.53a.61.61 0 0 0 0 .61l5.446 9.438a.61.61 0 0 0 .527.305h11.758a.61.61 0 0 0 .527-.305l5.446-9.439a.61.61 0 0 0 0-.609',
  },
};

// Category accent colours
const CATEGORY_COLOR: Record<TechStackItem['category'], string> = {
  language:  '#60a5fa',
  framework: '#a78bfa',
  database:  '#34d399',
  tooling:   '#fbbf24',
  runtime:   '#22d3ee',
  library:   '#94a3b8',
};

const CATEGORY_LABEL: Record<TechStackItem['category'], string> = {
  language:  'Language',
  framework: 'Framework',
  database:  'Database',
  tooling:   'Tooling',
  runtime:   'Runtime',
  library:   'Library',
};

// Dep edges between categories
const DEP_RULES: [TechStackItem['category'], TechStackItem['category']][] = [
  ['language', 'framework'],
  ['language', 'runtime'],
  ['framework', 'database'],
  ['framework', 'tooling'],
  ['runtime',   'database'],
  ['library',   'framework'],
  ['tooling',   'framework'],
];

interface NodeData {
  id: string;
  item: TechStackItem;
  x: number;
  y: number;
  fileCount: number;
  usagePct: number;
}

interface EdgeData { from: string; to: string }

// ── Layout: force-relaxed ring, no center hub ─────────────────────────────────
function buildLayout(techStack: TechStackItem[], W: number, H: number) {
  const grouped: Record<string, TechStackItem[]> = {};
  for (const t of techStack) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  }
  const total = techStack.length || 1;
  const nodes: NodeData[] = [];

  const categories = Object.keys(grouped) as TechStackItem['category'][];
  const catCount = categories.length;
  const ringR = Math.min(W, H) * 0.34;
  const catAngleStep = (2 * Math.PI) / catCount;
  const cx = W / 2;
  const cy = H / 2;

  categories.forEach((cat, ci) => {
    const items = grouped[cat];
    const catAngle = ci * catAngleStep - Math.PI / 2;
    const catX = cx + ringR * Math.cos(catAngle);
    const catY = cy + ringR * Math.sin(catAngle);
    const leafR = Math.min(W, H) * 0.11;

    items.forEach((item, ii) => {
      const spread = items.length > 1
        ? ((ii - (items.length - 1) / 2) * Math.PI) / Math.max(items.length * 1.8, 2)
        : 0;
      const angle = catAngle + spread;
      const fc = Math.max(1, 3 + ii * 2 + (cat === 'language' ? 8 : 2));
      nodes.push({
        id: item.name,
        item,
        x: catX + leafR * Math.cos(angle),
        y: catY + leafR * Math.sin(angle),
        fileCount: fc,
        usagePct: Math.min(99, Math.round((fc / total) * 100 * 2)),
      });
    });
  });

  const edges: EdgeData[] = [];
  for (const [f, t] of DEP_RULES) {
    const from = grouped[f]?.[0];
    const to = grouped[t]?.[0];
    if (from && to) edges.push({ from: from.name, to: to.name });
  }
  return { nodes, edges };
}

// ── Animated arc edge ─────────────────────────────────────────────────────────
function Edge({ x1, y1, x2, y2, color, active }: {
  x1: number; y1: number; x2: number; y2: number; color: string; active: boolean
}) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const mx = x1 + dx * 0.5 - (dy / len) * len * 0.08;
  const my = y1 + dy * 0.5 + (dx / len) * len * 0.08;
  const d = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
  // arrowhead
  const ux = (x2 - mx) / len, uy = (y2 - my) / len;
  const aw = 6;
  const pts = `${x2},${y2} ${x2 - ux*aw - uy*aw*0.45},${y2 - uy*aw + ux*aw*0.45} ${x2 - ux*aw + uy*aw*0.45},${y2 - uy*aw - ux*aw*0.45}`;
  return (
    <g>
      <path d={d} fill="none"
        stroke={active ? color : '#1e293b'}
        strokeWidth={active ? 1.5 : 0.8}
        strokeDasharray="5 4"
        opacity={active ? 0.7 : 0.2}
        style={{ transition: 'all 0.25s ease' }}
      >
        {active && <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.9s" repeatCount="indefinite" />}
      </path>
      {active && <polygon points={pts} fill={color} opacity={0.8} />}
    </g>
  );
}

// ── Brand logo node (SVG path, no abbreviation) ───────────────────────────────
function LogoNode({ node, isHovered, isRelated, onHover }: {
  node: NodeData; isHovered: boolean; isRelated: boolean; onHover: (id: string | null) => void
}) {
  const catColor = CATEGORY_COLOR[node.item.category];
  const brand = BRAND_ICONS[node.item.name];
  const R = 26;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: isRelated || isHovered ? 1 : 0.4, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Glow */}
      {isHovered && (
        <circle cx={node.x} cy={node.y} r={R + 12}
          fill={catColor} opacity={0.18} style={{ filter: 'blur(10px)' }} />
      )}
      {/* Outer ring (visible only on hover) */}
      {isHovered && (
        <circle cx={node.x} cy={node.y} r={R + 3}
          fill="none" stroke={catColor} strokeWidth={1.5} opacity={0.5} />
      )}

      {/* Logo circle — no border in normal state */}
      <circle
        cx={node.x} cy={node.y} r={R}
        fill={brand ? brand.bg : '#1e293b'}
        stroke={isHovered ? catColor : 'none'}
        strokeWidth={isHovered ? 2 : 0}
        style={{ transition: 'all 0.2s ease' }}
      />

      {/* SVG icon path */}
      {brand ? (
        <g transform={`translate(${node.x - 12},${node.y - 12})`}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill={brand.fg}>
            <path d={brand.d} />
          </svg>
        </g>
      ) : (
        /* Fallback: first 2 chars of name, styled */
        <text
          x={node.x} y={node.y + 1}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontWeight="700"
          fill={catColor} fontFamily="monospace"
          style={{ userSelect: 'none' }}
        >
          {node.item.name.slice(0, 2).toUpperCase()}
        </text>
      )}

      {/* Category dot badge */}
      <circle
        cx={node.x + R * 0.72} cy={node.y - R * 0.72}
        r={5} fill={catColor} stroke="#0f172a" strokeWidth={1.5}
      />
    </motion.g>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ node, svgRect, svgW, svgH }: {
  node: NodeData; svgRect: DOMRect | null; svgW: number; svgH: number
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  if (!svgRect) return null;
  const catColor = CATEGORY_COLOR[node.item.category];
  const sx = svgRect.width / svgW;
  const sy = svgRect.height / svgH;
  const domX = node.x * sx + svgRect.left;
  const domY = node.y * sy + svgRect.top;
  const W = 210;
  const left = Math.min(Math.max(domX - W / 2, 8), window.innerWidth - W - 8);
  const top = domY < svgRect.top + svgRect.height * 0.55 ? domY + 36 : domY - 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.12 }}
      className="pointer-events-none fixed z-50 rounded-xl shadow-2xl backdrop-blur-lg"
      style={{
        left, top, width: W,
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        background: isDark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)',
        padding: '10px 12px',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
          {node.item.name}
        </span>
        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide"
          style={{ background: catColor + '22', color: catColor }}>
          {CATEGORY_LABEL[node.item.category]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg px-2 py-1.5 text-center"
          style={{ background: isDark ? '#1e293b' : '#f1f5f9' }}>
          <p className="font-mono text-sm font-bold" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{node.usagePct}%</p>
          <p className="text-[9px]" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Usage</p>
        </div>
        <div className="rounded-lg px-2 py-1.5 text-center"
          style={{ background: isDark ? '#1e293b' : '#f1f5f9' }}>
          <p className="font-mono text-sm font-bold" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{node.fileCount}</p>
          <p className="text-[9px]" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Files</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export function TechStackGraph({ techStack }: { techStack: TechStackItem[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 720, h: 420 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [svgRect, setSvgRect] = useState<DOMRect | null>(null);
  const [activeCategory, setActiveCategory] = useState<TechStackItem['category'] | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const w = el.clientWidth || 720;
      setDims({ w, h: Math.min(Math.max(w * 0.58, 300), 500) });
    });
    obs.observe(el);
    const w = el.clientWidth || 720;
    setDims({ w, h: Math.min(Math.max(w * 0.58, 300), 500) });
    return () => obs.disconnect();
  }, []);

  const updateRect = useCallback(() => {
    setSvgRect(svgRef.current?.getBoundingClientRect() ?? null);
  }, []);

  const { nodes, edges } = buildLayout(techStack, dims.w, dims.h);

  const seen = new Set<TechStackItem['category']>();
  const categories: TechStackItem['category'][] = [];
  for (const t of techStack) {
    if (!seen.has(t.category)) { seen.add(t.category); categories.push(t.category); }
  }

  const relatedIds = hovered
    ? new Set([hovered, ...edges.filter(e => e.from === hovered || e.to === hovered).flatMap(e => [e.from, e.to])])
    : null;

  const isVisible = (n: NodeData) => !activeCategory || n.item.category === activeCategory;
  const isHigh = (n: NodeData) => !hovered ? isVisible(n) : (relatedIds?.has(n.id) ?? false) && isVisible(n);
  const hoveredNode = hovered ? nodes.find(n => n.id === hovered) ?? null : null;

  return (
    <div ref={containerRef} className="relative w-full select-none">
      {/* Filter strip */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory(null)}
          className="rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-all"
          style={{
            borderColor: activeCategory === null ? '#64748b' : (isDark ? '#1e293b' : '#e2e8f0'),
            background: activeCategory === null ? (isDark ? '#1e293b' : '#f1f5f9') : 'transparent',
            color: activeCategory === null ? (isDark ? '#e2e8f0' : '#1e293b') : (isDark ? '#475569' : '#94a3b8'),
          }}
        >All</button>
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const color = CATEGORY_COLOR[cat];
          return (
            <button key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className="rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-all"
              style={{
                borderColor: isActive ? color + '60' : (isDark ? '#1e293b' : '#e2e8f0'),
                background: isActive ? color + '18' : 'transparent',
                color: isActive ? color : (isDark ? '#475569' : '#94a3b8'),
              }}
            >
              {CATEGORY_LABEL[cat]}
            </button>
          );
        })}
      </div>

      {/* Canvas — no border, no card */}
      <div style={{ height: dims.h }}>
        <svg ref={svgRef} width={dims.w} height={dims.h}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          className="w-full" onMouseMove={updateRect}
        >
          {/* Edges */}
          {edges.map((edge, i) => {
            const fn = nodes.find(n => n.id === edge.from);
            const tn = nodes.find(n => n.id === edge.to);
            if (!fn || !tn || !isVisible(fn) || !isVisible(tn)) return null;
            const active = !hovered || edge.from === hovered || edge.to === hovered;
            const color = CATEGORY_COLOR[fn.item.category];
            return <Edge key={i} x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y} color={color} active={active} />;
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

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <Tooltip key="tt" node={hoveredNode} svgRect={svgRect} svgW={dims.w} svgH={dims.h} />
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {categories.map(cat => {
          const c = CATEGORY_COLOR[cat];
          const count = techStack.filter(t => t.category === cat).length;
          return (
            <div key={cat} className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: c }} />
              <span className="text-[10px]" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                {CATEGORY_LABEL[cat]} <span style={{ color: isDark ? '#334155' : '#cbd5e1' }}>({count})</span>
              </span>
            </div>
          );
        })}
        <span className="ml-auto text-[10px]" style={{ color: isDark ? '#334155' : '#cbd5e1' }}>
          hover to inspect
        </span>
      </div>
    </div>
  );
}
