# 📱 Restaurante Chinês — Mobile

App mobile para gerenciamento do cardápio de um restaurante chinês.

## Tecnologias

- **React Native** — framework mobile
- **Expo SDK 54** — plataforma de desenvolvimento
- **Expo Router** — navegação baseada em arquivos
- **TypeScript** — tipagem estática

## Estrutura

```
mobile/
├── app/
│   ├── _layout.tsx              # Stack Navigator raiz
│   ├── index.tsx                # Listagem de pratos
│   └── prato/
│       ├── [id].tsx             # Detalhes do prato
│       ├── novo.tsx             # Cadastrar prato
│       └── editar/[id].tsx      # Editar prato
├── components/
│   └── PratoForm.tsx            # Formulário reutilizável
├── services/
│   └── api.ts                   # Camada HTTP
└── constants/
    └── theme.ts                 # Design system
```

## Como rodar

```bash
npm install
npx expo start
```

Escaneie o QR Code com o **Expo Go** no celular.

> ⚠️ O celular e o computador precisam estar na **mesma rede Wi-Fi**.
> O IP do backend é detectado automaticamente pelo app via Expo Go.

## Requisito

O [backend](https://github.com/seu-usuario/restaurante-chines-backend) precisa estar rodando antes de abrir o app.
