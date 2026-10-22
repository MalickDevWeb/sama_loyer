# Recipes

Step-by-step cookbook for common tasks. Each recipe includes complete code you can copy.

---

## Adding a New Page

### 1. Create the folder and files

```
pages/my-page/
├── index.js
├── index.json
├── index.wxml
└── index.wxss
```

### 2. Register in app.json

```json
{
  "pages": [
    "pages/index/index",
    "pages/demo/index",
    "pages/my-page/index"
  ]
}
```

### 3. Page JS template

```javascript
import { createPageHelpers, showToast } from '../../utils/helpers/page';

const app = getApp();
const { STATE_KEYS } = app.globalData;

Page({
  data: {
    isLoading: true,
  },

  async onLoad(options) {
    // Wait for app initialization
    await app.globalData.initPromise;

    // Setup EventBus subscriptions (if needed)
    this._helpers = createPageHelpers(this, {
      // pageDataKey: STATE_KEYS.EVENTBUS_KEY,
    });
    this._helpers.subscribe();
    this._helpers.loadInitial();
  },

  onUnload() {
    if (this._helpers) {
      this._helpers.unsubscribe();
    }
  },
});
```

### 4. Page JSON template

```json
{
  "usingComponents": {
    "app-nav-bar": "/components/ui/nav-bar/index",
    "app-button": "/components/ui/button/index",
    "app-typography": "/components/ui/typography/index"
  }
}
```

### 5. Page WXML template

```xml
<view class="d-flex flex-column w-100" style="min-height: 100vh;">
  <app-nav-bar title="My Page" />

  <view class="d-flex flex-column gap-3 p-3" style="flex: 1;">
    <app-typography size="16" weight="700" color="#333">
      Page Title
    </app-typography>

    <!-- Your content here -->
  </view>
</view>
```

---

## Adding a New Component

### 1. Create the folder

```
components/costumers/ui/my-widget/
├── index.js
├── index.json
├── index.wxml
└── index.wxss
```

### 2. Component JS template

```javascript
Component({
  options: {
    multipleSlots: true,  // Enable named slots (if needed)
  },

  properties: {
    title: { type: String, value: '' },
    disabled: { type: Boolean, value: false },
  },

  data: {
    internalState: false,
  },

  lifetimes: {
    attached() {
      // Component inserted into page
    },
    detached() {
      // Cleanup
    },
  },

  methods: {
    handleTap() {
      if (this.data.disabled) return;
      this.triggerEvent('press', { value: this.data.internalState });
    },
  },
});
```

### 3. Component JSON

```json
{
  "component": true,
  "usingComponents": {}
}
```

### 4. Register in consuming page

```json
{
  "usingComponents": {
    "app-my-widget": "/components/costumers/ui/my-widget/index"
  }
}
```

### 5. Create a README.md for the component

Follow the template in [Components Overview](08-components-overview.md).

---

## Making an API Call

### 1. Add endpoint

In `utils/apis/index.js`:

```javascript
const ENDPOINTS = {
  USERS: '/users',
  PRODUCTS: '/products',
};
```

### 2. Add service method

```javascript
async getProducts(params = {}) {
  await authenticate();

  const res = await this.#client.get(ENDPOINTS.PRODUCTS, {
    query: { limit: params.limit || 20, offset: params.offset || 0 },
  });

  if (!res.success) {
    throw new Error(res.error?.message || 'Failed to fetch products');
  }

  // Optional: transform with Sculpt
  // return sculpt.data({ data: res.data, to: ProductSchema });
  return res.data;
}
```

### 3. Call from a page

```javascript
import { backendAPI } from '../../utils/apis/index';

Page({
  async onLoad() {
    try {
      const products = await backendAPI.getProducts({ limit: 10 });
      this.setData({ products });
    } catch (error) {
      showToast(error.message, 'error');
    }
  },
});
```

---

## Creating a Sculpt Schema

### 1. Examine your API response

```json
{
  "product_id": "abc",
  "product_name": "Widget",
  "unit_price": 29.99,
  "in_stock": true,
  "category": { "cat_id": 1, "cat_name": "Electronics" }
}
```

### 2. Define the schema

Create `utils/mappers/product.sculpt.js`:

```javascript
export const ProductSchema = {
  id: '@link.product_id',
  name: '@link.product_name',
  price: '@link.unit_price::number',
  inStock: '@link.in_stock::boolean',
  categoryName: '@link.category.cat_name',

  formattedPrice: (data) => {
    return `$${(data.unit_price || 0).toFixed(2)}`;
  },
};
```

### 3. Use in BackendAPI

```javascript
import { ProductSchema } from '../mappers/product.sculpt.js';

async getProducts() {
  await authenticate();
  const res = await this.#client.get('/products');
  return sculpt.data({ data: res.data, to: ProductSchema });
}
```

---

## Adding a Native Plugin Wrapper

### 1. Add to `utils/apis/native.js`

```javascript
export const scanQRCode = async () => {
  return withRetry(
    () => invokePlugin('scanQRCode', {}, { strict: false }),
    { maxAttempts: 2, baseDelay: 300 }
  );
};
```

### 2. Add to nativeService export

```javascript
export const nativeService = {
  getUserInfos,
  scanQRCode,
};
```

### 3. Add type definition (optional)

In `types/native.js`, add JSDoc typedef.

---

## Adding EventBus Middleware

```javascript
// In app.js or a utility file:
const removeLogger = Bus.use(async (eventData) => {
  console.log(`[EventLog] ${eventData.event}`, eventData.data);
});

// Auth guard example:
Bus.use(async (eventData) => {
  if (eventData.event.startsWith('purchase.') && !isAuthenticated()) {
    eventData.cancelled = true;
    console.warn('Purchase event blocked: not authenticated');
  }
});
```

---

## Creating a New Behavior

### 1. Create the file

`utils/behaviors/my-behavior.js`:

```javascript
export const myBehavior = Behavior({
  data: {
    sharedValue: '',
  },

  methods: {
    sharedMethod(arg) {
      this.setData({ sharedValue: arg });
    },
  },
});
```

### 2. Use in a page or component

```javascript
import { myBehavior } from '../../utils/behaviors/my-behavior';

Page({
  behaviors: [myBehavior],
  // Now has this.data.sharedValue and this.sharedMethod()
});
```

---

## Adding a WXS Filter

### 1. Add to `utils/wxs/filters.wxs`

```javascript
// ES5 only!
function myFilter(value) {
  if (!value) return '';
  return value.toString().toUpperCase();
}

module.exports = {
  // ...existing exports,
  myFilter: myFilter,
};
```

### 2. Use in WXML

```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />
<text>{{ f.myFilter(item.name) }}</text>
```

---

## Implementing Offline Support

```javascript
// In your page:
const app = getApp();
const { STATE_KEYS } = app.globalData;
const Bus = app.globalData.eventBus;

Page({
  data: { isOffline: false },

  onLoad() {
    this._unsubNetwork = Bus.onState(STATE_KEYS.NETWORK_CONNECTED, (change) => {
      this.setData({ isOffline: !change.value });
      if (change.value) {
        this.reloadData();  // Back online — refresh
      }
    });
  },

  onUnload() {
    this._unsubNetwork?.();
  },
});
```

```xml
<view wx:if="{{ isOffline }}" class="p-2" style="background: #fff3cd; text-align: center;">
  <app-typography size="12" color="#856404">You are offline</app-typography>
</view>
```

## See Also

- [Project Architecture](02-project-architecture.md) — Understand the module structure
- [Components Overview](08-components-overview.md) — Component catalog
- [API Layer](06-api-layer.md) — HTTP client and auth details
