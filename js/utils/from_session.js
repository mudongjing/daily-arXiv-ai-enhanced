
export function getInstance(name) {
  return JSON.parse(sessionStorage.getItem(name));
}


export function setInstance(name, instance) {
  sessionStorage.setItem(name, JSON.stringify(instance));
}