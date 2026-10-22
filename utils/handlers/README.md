# Handlers

This directory is for shared event handlers and middleware functions.

## Conventions

- One handler per file
- Export as named functions
- Document expected event/data shape with JSDoc

## Example Use Cases

- Analytics event handler (log user actions)
- Error reporting handler (send errors to monitoring service)
- Auth guard middleware (block events when unauthenticated)

## Example

```javascript
// utils/handlers/analytics.js
export const analyticsHandler = async (eventData) => {
  if (eventData.event.startsWith('user.')) {
    console.log('[Analytics]', eventData.event, eventData.data);
    // Send to analytics service
  }
};

// Usage in app.js:
// Bus.use(analyticsHandler);
```

## See Also

- [EventBus Guide: Middleware](../../docs/05-eventbus-guide.md#middleware)
