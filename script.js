// حاسبة الزكاة - أسعار الذهب والفضة تلقائيًا
// يتم جلب الأسعار من XAUS API

const API_URL = "https://xaus.com/api/v1/spot";

// تحويل الأونصة الترويسية إلى جرام
const TROY_OUNCE_TO_GRAMS = 31.1034768;

// جلب أسعار الذهب والفضة الحالية
async function getMetalPrices() {
    const response = await fetch(
        API_URL + "?currency=USD&unit=gram&fresh=" + Date.now()
    );

    if (!response.ok) {
        throw new Error("تعذر الحصول على أسعار المعادن");
    }

    const data = await response.json();

    // سعر الذهب بالدولار لكل جرام
    const goldPricePerGram = Number(data.per_gram_usd);

    // سعر الفضة بالدولار لكل أونصة
    const silverPricePerOunce = Number(data.silver_usd_oz);

    // تحويل سعر الفضة من الأونصة إلى الجرام
    const silverPricePerGram =
        silverPricePerOunce / TROY_OUNCE_TO_GRAMS;

    if (
        !Number.isFinite(goldPricePerGram) ||
        !Number.isFinite(silverPricePerGram)
    ) {
        throw new Error("أسعار المعادن غير صالحة");
    }

    return {
        goldPricePerGram,
        silverPricePerGram,
        updatedAt: data.updated_at || null
    };
}


// دالة حساب الزكاة
async function calculateZakat() {

    const resultDiv = document.getElementById("result");

    // إظهار رسالة أثناء جلب السعر
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "⏳ جاري تحديث سعر الذهب والفضة وحساب الزكاة...";

    try {

        // قراءة البيانات من النموذج
        const cash =
            parseFloat(document.getElementById("cash").value) || 0;

        const goldGrams =
            parseFloat(document.getElementById("gold").value) || 0;

        const silverGrams =
            parseFloat(document.getElementById("silver").value) || 0;

        const trade =
            parseFloat(document.getElementById("trade").value) || 0;

        const debt =
            parseFloat(document.getElementById("debt").value) || 0;


        // منع القيم السالبة
        if (
            cash < 0 ||
            goldGrams < 0 ||
            silverGrams < 0 ||
            trade < 0 ||
            debt < 0
        ) {
            resultDiv.innerHTML =
                "⚠️ الرجاء إدخال أرقام صحيحة وغير سالبة.";
            return;
        }


        // الحصول على الأسعار الحالية
        const prices = await getMetalPrices();

        const goldPricePerGram = prices.goldPricePerGram;
        const silverPricePerGram = prices.silverPricePerGram;


        // حساب قيمة الذهب
        const goldValue =
            goldGrams * goldPricePerGram;


        // حساب قيمة الفضة
        const silverValue =
            silverGrams * silverPricePerGram;


        // إجمالي المال الزكوي
        const totalWealth =
            cash +
            goldValue +
            silverValue +
            trade -
            debt;


        // النصاب = 85 جرام ذهب
        const nisabGold =
            85 * goldPricePerGram;


        // التأكد من عدم وجود مبلغ سالب
        const zakatableWealth =
            Math.max(0, totalWealth);


        // حساب الزكاة
        const zakatDue =
            zakatableWealth * 0.025;


        // عرض الأسعار للمستخدم
        const priceDate = prices.updatedAt
            ? new Date(prices.updatedAt).toLocaleString("ar")
            : "الآن";


        // إذا كان المال أقل من النصاب
        if (zakatableWealth < nisabGold) {

            resultDiv.innerHTML = `
                <strong>لا تجب الزكاة حاليًا</strong><br><br>

                إجمالي المال الزكوي:
                <strong>${zakatableWealth.toFixed(2)}$</strong><br>

                النصاب الحالي:
                <strong>${nisabGold.toFixed(2)}$</strong><br><br>

                🥇 سعر جرام الذهب:
                <strong>${goldPricePerGram.toFixed(2)}$</strong><br>

                🥈 سعر جرام الفضة:
                <strong>${silverPricePerGram.toFixed(2)}$</strong><br><br>

                آخر تحديث للأسعار:
                <strong>${priceDate}</strong>
            `;

        } else {

            resultDiv.innerHTML = `
                <strong>مقدار الزكاة الواجب إخراجه:</strong><br><br>

                <span style="font-size:1.5em;">
                    ${zakatDue.toFixed(2)}$
                </span>

                <br><br>

                إجمالي المال الزكوي:
                <strong>${zakatableWealth.toFixed(2)}$</strong><br>

                النصاب الحالي:
                <strong>${nisabGold.toFixed(2)}$</strong><br><br>

                🥇 سعر جرام الذهب:
                <strong>${goldPricePerGram.toFixed(2)}$</strong><br>

                🥈 سعر جرام الفضة:
                <strong>${silverPricePerGram.toFixed(2)}$</strong><br><br>

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
