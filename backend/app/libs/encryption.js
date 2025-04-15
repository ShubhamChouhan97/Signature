import bcrypt from "bcryptjs";
const passRound = 3;

export const bcryptPass = async (string) => {
  const salt = await bcrypt.genSalt(passRound);
  return bcrypt.hash(string, salt);
};

export const compareBcrypt = (bcrString, originalString) => {
  return bcrypt.compare(originalString, bcrString);
};

export const generatePassword = (length) => {
  let password = "";
  const chars = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "abcdefghijklmnopqrstuvwxyz",
    "@$!%*?&",
    "1234567890",
  ];
  for (let j = 0; j < chars.length; j++) {
    password += chars[j].charAt(Math.floor(Math.random() * chars[j].length));
  }
  if (length > chars.length) {
    length = length - chars.length;
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * chars.length);
      password += chars[index].charAt(
        Math.floor(Math.random() * chars[index].length)
      );
    }
  }
  return password
    .split("")
    .sort(function () {
      return 0.5 - Math.random();
    })
    .join("");
};
