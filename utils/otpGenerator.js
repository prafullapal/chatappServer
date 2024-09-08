function generateFourDigitOTP() {
  const array = new Uint16Array(1);
  crypto.getRandomValues(array);
  const randomNumber = array[0] % 10000;
  return randomNumber.toString().padStart(4, "0");
}

module.exports = generateFourDigitOTP;
