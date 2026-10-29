export const rooms = new Map();

export function getValidRoom(rawCode) {
    if (!/^[a-fA-F0-9]{6}$/.test(rawCode)) return null;
    return rooms.get(rawCode.toUpperCase()) || null;
}