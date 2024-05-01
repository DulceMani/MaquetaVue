export const API = 'http://localhost:3000'

export const fechaActual = () => {
  let fecha = new Date();
  let year = fecha.getFullYear();
  let month = String(fecha.getMonth() + 1).padStart(2, '0');
  let day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const fileToBytes = async (file: File, callback: (bytes: Uint8Array) => void) => {
  const reader = new FileReader();
  reader.onload = async (event) => {
    const arrayBuffer = event.target?.result as ArrayBuffer;
    const bytes = new Uint8Array(arrayBuffer);
    callback(bytes);
  };
  reader.readAsArrayBuffer(file);
}

export const generateFileUrl = (bytes: Uint8Array) => {
  // Convertir los bytes en un Blob
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  // Generar y devolver la URL del Blob
  return URL.createObjectURL(blob);
}

export const bytesToBase64 = async (bytes: Uint8Array) => {
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

export const base64ToUrl = (base64Data: string, fileType: string): string => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: fileType });
  return URL.createObjectURL(blob);
}