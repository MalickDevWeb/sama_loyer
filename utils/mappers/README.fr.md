# Mappers

Définitions de schéma Sculpt pour transformer les réponses API en modèles métier.

## Convention de nommage

Les fichiers sont nommés `*.sculpt.js` pour les distinguer des modules normaux :
```
utils/mappers/
├── example.sculpt.js     # Schémas d'exemple (UserSchema, ItemSchema)
├── product.sculpt.js     # Vos schémas produit
└── README.md
```

## Exemple

```javascript
// utils/mappers/example.sculpt.js
export const UserSchema = {
  id: '@link.user_id',
  fullName: (data) => `${data.first_name} ${data.last_name}`,
  email: '@link.email_address',
};
```

## Utilisation

```javascript
import { sculpt } from '../json-sculpt/sculpt';
import { UserSchema } from '../mappers/example.sculpt.js';

const user = sculpt.data({ data: apiResponse, to: UserSchema });
```

## Voir aussi

- [JSON Sculpt Guide](../../docs/07-json-sculpt-guide.md) — référence de syntaxe de schéma
- [Recipes: Creating a Sculpt Schema](../../docs/14-recipes.md#creating-a-new-sculpt-schema)
