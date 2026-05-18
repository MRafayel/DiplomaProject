let chartInstance = null, dpInstance = null;
let lastAllocationData = null; // Caches global system states for real-time localization swaps

// --- i18n TRANSLATION ENGINE ---
let currentLang = 'en';
const translations = {
    en: {
        dashboardTitle: "InvestOptimize | Pro Dashboard",
        dataSelection: "Data Selection",
        uploadText: "Click or drag data file",
        preview: "Preview",
        changeFile: "✕ Change File",
        parameters: "Parameters",
        totalBudget: "Total Budget (mln)",
        stepSize: "Step Size (mln)",
        calcLogic: "Calculation Logic",
        strict: "Strict",
        flexible: "Flexible",
        optimizeBtn: "Optimize Portfolio",
        analyzing: "Analyzing...",
        totalReturn: "Total Return (mln)",
        remainBudget: "Remaining Budget (mln)",
        recommended: "Best 🏆",
        budgetAlloc: "Budget Allocation",
        roiLine: "ROI Performance Line",
        allocTable: "Allocation Table",
        project: "Project",
        investment: "Investment (mln)",
        roi: "ROI (mln)",
        strategicSummary: "Strategic Summary",
        optComplete: "Optimization Complete",
        serverFailed: "Server Connection Failed",
        chartLabel: "ROI Potential"
    },
    hy: {
        dashboardTitle: "InvestOptimize | Pro Dashboard",
        dataSelection: "Տվյալներ",
        uploadText: "Կտտացրեք կամ քաշեք տվյալների ֆայլը",
        preview: "Նախադիտում",
        changeFile: "✕ Փոխել Ֆայլը",
        parameters: "Պարամետրեր",
        totalBudget: "Ընդհանուր Բյուջե (մլն)",
        stepSize: "Քայլի Չափ (մլն)",
        calcLogic: "Հաշվարկի Տրամաբանություն",
        strict: "Խիստ",
        flexible: "Ճկուն",
        optimizeBtn: "Օպտիմալացնել Պորտֆելը",
        analyzing: "Վերլուծություն...",
        totalReturn: "Ընդհանուր Եկամտաբերություն (մլն)",
        remainBudget: "Մնացորդային Բյուջե (մլն)",
        recommended: "Ամենալավը 🏆",
        budgetAlloc: "Բյուջեի Բաշխում",
        roiLine: "ROI-ի Դինամիկա",
        allocTable: "Բաշխման Աղյուսակ",
        project: "Նախագիծ",
        investment: "Ներդրում (մլն)",
        roi: "ROI (մլն)",
        strategicSummary: "Ռազմավարական Ամփոփում",
        optComplete: "Օպտիմալացումն Ավարտվեց",
        serverFailed: "Սերվերի Միացման Ձախողում",
        chartLabel: "ROI-ի Պոտենցիալ"
    }
};

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hy' : 'en';
    document.getElementById('htmlTag').setAttribute('lang', currentLang);
    document.title = translations[currentLang].dashboardTitle;
    document.getElementById('langToggle').innerText = currentLang === 'en' ? '🌐 AM' : '🌐 EN';

    // Parse specific nodes marked with translation tokens
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
                    node.textContent = translations[currentLang][key];
                }
            });
            if (el.tagName === 'STRONG') {
                el.innerText = translations[currentLang][key];
            }
        }
    });

    // Evaluate and mutate active interactive states safely
    const submitBtn = document.getElementById("submitBtn");
    if (!submitBtn.disabled) {
        submitBtn.innerText = translations[currentLang].optimizeBtn;
    } else if (submitBtn.innerText !== "Optimize Portfolio" && submitBtn.innerText !== "Օպտիմալացնել Պորտֆելը") {
        submitBtn.innerText = translations[currentLang].analyzing;
    }

    // Force context labels rewrite over the presentation charts array inside memory
    if (lastAllocationData) {
        renderCharts(lastAllocationData);
    }
}

// --- UTILITY SYSTEMS ---
const showToast = (msgKey, type="success") => {
    const t = document.getElementById("toast");
    t.style.background = type === "success" ? "var(--success)" : "var(--danger)";
    t.innerText = translations[currentLang][msgKey] || msgKey;
    t.style.display = "block";
    setTimeout(() => t.style.display = "none", 3000);
};

const generateColors = (count) => Array.from({ length: count }, (_, i) => `hsl(${(i * 360) / count}, 70%, 60%)`);
function toggleDarkMode() { document.body.classList.toggle("dark"); }

// --- STATE MANAGEMENT ---
const clearResults = () => {
    document.getElementById("resultsSection").style.display = "none";
    document.getElementById("actualContent").style.display = "none";
    lastAllocationData = null;
    if (chartInstance) chartInstance.destroy();
    if (dpInstance) dpInstance.destroy();
};

// --- INITIALIZE UI LISTENERS WHEN DOM CONTENT LOADING COMPLETE ---
document.addEventListener("DOMContentLoaded", () => {
    // Stepper Incrementation Control Core
    document.querySelectorAll('.stepper-container').forEach(container => {
        const input = container.querySelector('input');
        const stepAmount = parseInt(container.dataset.stepVal) || 1;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.stepper-btn');
            if (!btn) return;
            let val = parseInt(input.value) || 0;
            input.value = btn.dataset.type === 'plus' ? val + stepAmount : Math.max(0, val - stepAmount);
        });
    });

    // Handle Upload Execution File Streams
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        clearResults();
        document.getElementById('fileNameDisplay').innerText = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
            renderPreview(json);
            document.getElementById('drop-state').style.display = 'none';
            document.getElementById('preview-state').style.display = 'flex';
            document.getElementById('uploadZone').classList.add('active-preview');
        };
        reader.readAsArrayBuffer(file);
    });
});

function renderPreview(data) {
    const table = document.getElementById('previewTable');
    table.innerHTML = data.slice(0, 11).map((row, i) => `
        <tr>${row.map(cell => i === 0 ? `<th>${cell ?? ''}</th>` : `<td>${cell ?? ''}</td>`).join('')}</tr>
    `).join('');
}

function resetUpload() {
    document.getElementById('fileInput').value = "";
    document.getElementById('drop-state').style.display = 'flex';
    document.getElementById('preview-state').style.display = 'none';
    document.getElementById('uploadZone').classList.remove('active-preview');
    clearResults();
}

// --- CORE OPTIMIZATION PIPELINE ---
document.getElementById("form").onsubmit = async (e) => {
    e.preventDefault();
    const resultsSection = document.getElementById("resultsSection");
    const skeleton = document.getElementById("skeletonState");
    const content = document.getElementById("actualContent");
    const submitBtn = document.getElementById("submitBtn");

    resultsSection.style.display = "block";
    skeleton.style.display = "block";
    content.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.innerText = translations[currentLang].analyzing;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
        const formData = new FormData(e.target);
        const res = await fetch("/optimize", { method: "POST", body: formData });
        const data = await res.json();

        if (data.error) {
            showToast(data.message, "error");
            resultsSection.style.display = "none";
        } else {
            lastAllocationData = data.allocation;

            // Paint Data Box Values
            document.getElementById("totalBox").innerText = data.total_return.toLocaleString();
            document.getElementById("remainBox").innerText = data.remaining_budget.toLocaleString();

            const tbody = document.getElementById("resultsBody");
            let bestName = "", maxRet = -1;
            const labels = Object.keys(data.allocation);

            // Locate Outperforming Metric Node
            labels.forEach(p => {
                if (data.allocation[p].expected_return > maxRet) {
                    maxRet = data.allocation[p].expected_return;
                    bestName = p;
                }
            });

            // Parse Virtual Rows Block
            let tableRows = "";
            labels.forEach(p => {
                const r = data.allocation[p];
                tableRows += `
                    <tr class="${p === bestName ? 'best-row' : ''}">
                        <td>${p} ${p === bestName ? '🏆' : ''}</td>
                        <td>${r.investment.toLocaleString()}</td>
                        <td>${r.expected_return.toLocaleString()}</td>
                    </tr>`;
            });

            tbody.innerHTML = tableRows;
            document.getElementById("bestProjectName").innerText = bestName;
            document.getElementById("bestProjectCard").className = "stat-card highlight";
            document.getElementById("explanationBox").innerText = data.explanation;

            renderCharts(data.allocation);
            skeleton.style.display = "none";
            content.style.display = "block";
            showToast("optComplete");
        }
    } catch (err) {
        showToast("serverFailed", "error");
        resultsSection.style.display = "none";
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = translations[currentLang].optimizeBtn;
    }
};

function renderCharts(allocation) {
    const labels = Object.keys(allocation);
    const invData = labels.map(p => allocation[p].investment);
    const retData = labels.map(p => allocation[p].expected_return);
    const dynamicColors = generateColors(labels.length);

    if (chartInstance) chartInstance.destroy();
    if (dpInstance) dpInstance.destroy();

    chartInstance = new Chart(document.getElementById("chart"), {
        type: 'doughnut',
        data: { labels, datasets: [{ data: invData, backgroundColor: dynamicColors, borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom' } } }
    });

    dpInstance = new Chart(document.getElementById("dpChart"), {
        type: 'line',
        data: {
            labels,
            datasets: [{ label: translations[currentLang].chartLabel, data: retData, borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.1)', fill: true, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}