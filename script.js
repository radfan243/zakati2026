// حاسبة الزكاة - أسعار الذهب والفضة تلقائيًا
// يحافظ هذا الملف على وظيفة الحاسبة الحالية مع تحسين التحقق والتوافق مع الهاتف.

const API_URL = "https://xaus.com/api/v1/spot";
const TROY_OUNCE_TO_GRAMS = 31.1034768;
const ZAKAT_RATE = 0.025;
const GOLD_NISAB_GRAMS = 85;

function getNumber(id) {
    const element = document.getElementById(id);
    if (!element) return 0;
    const value = String(element.value ?? "").trim().replace(",", ".");
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
}

function money(value) {
    return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

async function getMetalPrices() {
    const response = await fetch(
        API_URL + "?currency=USD&unit=gram&fresh=" + Date.now(),
        { cache: "no-store" }
    );

    if (!response.ok) {
        throw new Error("تعذر الحصول على أسعار المعادن");
    }

    const data = await response.json();
    const goldPricePerGram = Number(data.per_gram_usd);
    const silverPricePerOunce = Number(data.silver_usd_oz);
    const silverPricePerGram = silverPricePerOunce / TROY_OUNCE_TO_GRAMS;

    if (
        !Number.isFinite(goldPricePerGram) || goldPricePerGram <= 0 ||
        !Number.isFinite(silverPricePerGram) || silverPricePerGram <= 0
    ) {
        throw new Error("أسعار المعادن غير صالحة");
    }

    return {
        goldPricePerGram,
        silverPricePerGram,
        updatedAt: data.updated_at || null
    };
}

async function calculateZakat() {
    const resultDiv = document.getElementById("result");
    if (!resultDiv) return;

    resultDiv.style.display = "block";
    resultDiv.innerHTML = "⏳ جاري تحديث سعر الذهب والفضة وحساب الزكاة...";

    try {
        const cash = getNumber("cash");
        const goldGrams = getNumber("gold");
        const silverGrams = getNumber("silver");
        const trade = getNumber("trade");
        const debt = getNumber("debt");

        const fields = [cash, goldGrams, silverGrams, trade, debt];
        if (fields.some((value) => value < 0)) {
            resultDiv.innerHTML = "⚠️ الرجاء إدخال أرقام صحيحة وغير سالبة.";
            return;
        }

        const prices = await getMetalPrices();
        const goldPricePerGram = prices.goldPricePerGram;
        const silverPricePerGram = prices.silverPricePerGram;

        const goldValue = goldGrams * goldPricePerGram;
        const silverValue = silverGrams * silverPricePerGram;
        const totalWealth = cash + goldValue + silverValue + trade - debt;
        const zakatableWealth = Math.max(0, totalWealth);
        const nisabGold = GOLD_NISAB_GRAMS * goldPricePerGram;
        const zakatDue = zakatableWealth >= nisabGold
            ? zakatableWealth * ZAKAT_RATE
            : 0;

        const priceDate = prices.updatedAt
            ? new Date(prices.updatedAt).toLocaleString("ar")
            : "الآن";

        if (zakatableWealth < nisabGold) {
            resultDiv.innerHTML = `
                <strong>لا تجب الزكاة حاليًا</strong><br><br>
                إجمالي المال الزكوي:
                <strong>${money(zakatableWealth)}$</strong><br>
                النصاب الحالي:
                <strong>${money(nisabGold)}$</strong><br><br>
                🥇 سعر جرام الذهب:
                <strong>${money(goldPricePerGram)}$</strong><br>
                🥈 سعر جرام الفضة:
                <strong>${money(silverPricePerGram)}$</strong><br><br>
                آخر تحديث للأسعار:
                <strong>${priceDate}</strong>
            `;
        } else {
            resultDiv.innerHTML = `
                <strong>مقدار الزكاة الواجب إخراجه:</strong><br><br>
                <span style="font-size:1.5em;">${money(zakatDue)}$</span>
                <br><br>
                إجمالي المال الزكوي:
                <strong>${money(zakatableWealth)}$</strong><br>
                النصاب الحالي:
                <strong>${money(nisabGold)}$</strong><br><br>
                🥇 سعر جرام الذهب:
                <strong>${money(goldPricePerGram)}$</strong><br>
                🥈 سعر جرام الفضة:
                <strong>${money(silverPricePerGram)}$</strong><br><br>
                نسبة الزكاة:
                <strong>2.5%</strong><br>
                آخر تحديث للأسعار:
                <strong>${priceDate}</strong>
            `;
        }
    } catch (error) {
        console.error("Zakat calculator error:", error);
        resultDiv.style.display = "block";
        resultDiv.innerHTML = `
            ⚠️ تعذر تحديث أسعار الذهب والفضة حاليًا.<br><br>
            يرجى التأكد من اتصال الإنترنت ثم المحاولة مرة أخرى.
        `;
    }
}
