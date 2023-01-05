import React, { ComponentProps, FC } from "react";

export default function convertCharacterToHex(characterInput: string) {
  const character: string[] = [];
  // @ts-ignore
  [...characterInput].forEach((char) => {
    if (char === "&") {
      const combinedHex = `%${char.charCodeAt(0).toString(16)}`;
      character.push(combinedHex);
    } else {
      character.push(char);
    }
  });
  return character?.join("");
}
