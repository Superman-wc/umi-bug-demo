export function onRouteChange({ location, routes, action }) {
  window.TDAPP && window.TDAPP.onEvent('onRouteChange', location.pathname+location.search+location.hash, {action});
}
