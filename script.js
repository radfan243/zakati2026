function calculateZakat() {
  const cash = parseFloat(document.getElementById('cash').value) || 0;
  const goldGrams = parseFloat(document.getElementById('gold').value) || 0;
  const silverGrams = parseFloat(document.getElementById('silver').value) || 0;
  const trade = parseFloat(document.getElementById('trade').value) || 0;
  const debt = parseFloat(document.getElementById('debt').value) || 0;

  const goldPricePerGram = 75;
  const silverPricePerGram = 0.9;

  const goldValue = goldGrams * goldPricePerGram;
  const silverValue = silverGrams * silverPricePerGram;

  const totalWealth = cash + goldValue + silverValue + trade - debt;

  const nisabGold = 85 * goldPricePerGram;

  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'block';

  if (totalWealth < nisabGold) {
    resultDiv.innerHTML = `المبلغ أقل من النصاب (${nisabGold.toFixed(0)}$)، لا تجب عليك الزكاة حاليًا.`;
  } else {
    const zakatDue = totalWealth * 0.025;
    resultDiv.innerHTML = `مقدار الزكاة الواجب إخراجه: <br> ${zakatDue.toFixed(2)}$`;
  }
}