/* -------------------------------------------------------------
   NAIS BRAND CALCULATOR LOGIC (app.js)
   ------------------------------------------------------------- */

// Slownik mapujacy wielkosc firmy (N)
const employeeRanges = {
    'under1k':  { label: 'Poniżej 1 000',    N: 0,     prefillP: 0,  HR_ops: 0,  V: 0 },
    '1k-5k':    { label: '1 000 – 5 000',    N: 2500,  prefillP: 45, HR_ops: 4,  V: 20 },
    '5k-10k':   { label: '5 000 – 10 000',   N: 7500,  prefillP: 35, HR_ops: 8,  V: 20 },
    '10k-20k':  { label: '10 000 – 20 000',  N: 15000, prefillP: 28, HR_ops: 15, V: 18 },
    '20k-40k':  { label: '20 000 – 40 000',  N: 30000, prefillP: 22, HR_ops: 28, V: 18 },
    '40k-100k': { label: '40 000 – 100 000', N: 70000, prefillP: 18, HR_ops: 65, V: 16 }
};

// Slownik wynagrodzen (W)
const salaryRanges = {
    'low':     { label: 'Wyraźnie poniżej średniej', W: 5600 },
    'average': { label: 'Na poziomie średniej',      W: 8000 },
    'above':   { label: 'Powyżej średniej',           W: 10400 },
    'high':    { label: 'Wyraźnie powyżej średniej',  W: 13000 }
};

// Slownik branz
const industries = {
    'production': { label: 'Produkcja i przemysł',             rotation: 0.18 },
    'logistics':  { label: 'Handel i logistyka',               rotation: 0.24 },
    'energy':     { label: 'Energetyka i utilities',           rotation: 0.10 },
    'finance':    { label: 'Usługi finansowe i ubezpieczenia', rotation: 0.13 },
    'it':         { label: 'IT i technologie',                 rotation: 0.16 },
    'healthcare': { label: 'Ochrona zdrowia i farmacja',       rotation: 0.20 },
    'retail':     { label: 'Handel detaliczny',                rotation: 0.26 },
    'other':      { label: 'Inna',                             rotation: 0.17 }
};

// Slownik zaangazowania (E)
const engagementLevels = {
    'high':    { label: 'Wysokie',                     E: 0.55 },
    'medium':  { label: 'Przeciętne',                  E: 0.30 },
    'low':     { label: 'Niskie',                      E: 0.15 },
    'unknown': { label: 'Nie wiem / nie mierzyliśmy',  E: 0.23 } // Gallup 2025
};

// Slownik komunikacji (U)
const communicationLevels = {
    'good':   { label: 'Dobra',      U: 0.78 },
    'medium': { label: 'Przeciętna', U: 0.58 },
    'bad':    { label: 'Słaba',      U: 0.38 }
};

// Domeny publiczne do walidacji e-maila
const publicEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 
    'icloud.com', 'aol.com', 'msn.com', 'mail.ru', 'yandex.ru',
    'wp.pl', 'onet.pl', 'o2.pl', 'interia.pl', 'tlen.pl', 'gazeta.pl', 
    'poczta.onet.pl', 'poczta.fm', 'home.pl', 'autograf.pl', 'op.pl', 'mail.com'
];

// Stan aplikacji
let state = {
    employeeRangeKey: null,
    salaryRangeKey: null,
    industryKey: null,
    paperPercentage: null,
    engagementKey: null,
    communicationKey: null,
    leadInfo: {
        name: '',
        email: '',
        role: ''
    }
};

// Historia nawigacji
let navigationHistory = [];

// DOM Elements
const screens = {
    landingCfo: document.getElementById('screen-landing-cfo'),
    landingHr: document.getElementById('screen-landing-hr'),
    company: document.getElementById('screen-company'),
    disqualified: document.getElementById('screen-disqualified'),
    processes: document.getElementById('screen-processes'),
    people: document.getElementById('screen-people'),
    gate: document.getElementById('screen-gate'),
    loading: document.getElementById('screen-loading'),
    results: document.getElementById('screen-results')
};

const progressWrapper = document.getElementById('progress-bar-wrapper');

// Inicjalizacja i event listenery po zaladowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    detectLandingPage();
});

// Obsługa zmiany hasha w adresie URL bez przeładowania strony (ułatwia testowanie lokalne)
window.addEventListener('hashchange', () => {
    detectLandingPage();
});

function initEventListeners() {
    // SCREEN 1: Twoja firma
    const empRadios = document.querySelectorAll('input[name="employee-count"]');
    const salRadios = document.querySelectorAll('input[name="salary-level"]');
    const indSelect = document.getElementById('industry-select');
    const btnS1Next = document.getElementById('btn-screen-1-next');

    const checkS1Validity = () => {
        const isEmpSelected = [...empRadios].some(r => r.checked);
        const isSalSelected = [...salRadios].some(r => r.checked);
        const isIndSelected = indSelect.value !== '';
        btnS1Next.disabled = !(isEmpSelected && isSalSelected && isIndSelected);
    };

    empRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            state.employeeRangeKey = val;
            checkS1Validity();
            
            // Specjalna sciezka: Natychmiastowa dyskwalifikacja
            if (val === 'under1k') {
                transitionToScreen('disqualified');
            }
        });
    });

    salRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.salaryRangeKey = e.target.value;
            checkS1Validity();
        });
    });

    indSelect.addEventListener('change', (e) => {
        state.industryKey = e.target.value;
        checkS1Validity();
    });

    btnS1Next.addEventListener('click', () => {
        // Przed przejsciem dalej, ustawiamy domyslny prefill dla Slidera w Ekranie 2
        const config = employeeRanges[state.employeeRangeKey];
        if (config) {
            state.paperPercentage = config.prefillP;
            document.getElementById('paper-processes-slider').value = config.prefillP;
            document.getElementById('slider-percentage-value').innerText = config.prefillP;
            
            // Ustawiamy dynamiczny tekst benchmarku
            document.getElementById('benchmark-processes-text').innerHTML = 
                `Firmy podobnej wielkości obsługują średnio <strong>${config.prefillP}%</strong> procesów HR jeszcze papierowo — dane z 200+ wdrożeń NAIS.`;
        }
        transitionToScreen('processes');
    });

    // EKRAN DYSKWALIFIKACJI
    const disqForm = document.getElementById('disqualified-form');
    const disqEmail = document.getElementById('disq-email');
    const disqEmailError = document.getElementById('disq-email-error');
    const btnDisqBack = document.getElementById('btn-disq-back');

    disqEmail.addEventListener('input', () => {
        validateEmailField(disqEmail, disqEmailError);
    });

    disqForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateEmailField(disqEmail, disqEmailError)) {
            return;
        }
        
        state.leadInfo.name = document.getElementById('disq-name').value;
        state.leadInfo.email = disqEmail.value;
        state.leadInfo.role = 'Firma < 1000 pracowników';

        console.log('%c[NAIS LEAD MAGNET] Lead z Ekranu Dyskwalifikacji:', 'color: #108a00; font-weight: bold;', state);
        
        alert(`Dziękujemy ${state.leadInfo.name}! Twój wniosek o indywidualną konsultację został zapisany. Skontaktujemy się na adres ${state.leadInfo.email} w ciągu 1 dnia roboczego.`);
        resetCalculator();
    });

    btnDisqBack.addEventListener('click', () => {
        // Resetujemy wybor pracownikow, zeby zapobiec nieskonczonej petli
        empRadios.forEach(r => r.checked = false);
        state.employeeRangeKey = null;
        checkS1Validity();
        transitionToScreen('company', false);
    });

    // EKRAN 2: Procesy HR
    const slider = document.getElementById('paper-processes-slider');
    const sliderVal = document.getElementById('slider-percentage-value');
    const btnS2Back = document.getElementById('btn-screen-2-back');
    const btnS2Next = document.getElementById('btn-screen-2-next');

    slider.addEventListener('input', (e) => {
        const val = e.target.value;
        state.paperPercentage = parseInt(val);
        sliderVal.innerText = val;
    });

    btnS2Back.addEventListener('click', () => {
        transitionToScreen('company', false);
    });

    btnS2Next.addEventListener('click', () => {
        transitionToScreen('people');
    });

    // EKRAN 3: Ludzie i komunikacja
    const engRadios = document.querySelectorAll('input[name="engagement-level"]');
    const commRadios = document.querySelectorAll('input[name="communication-level"]');
    const btnS3Back = document.getElementById('btn-screen-3-back');
    const btnS3Next = document.getElementById('btn-screen-3-next');

    const checkS3Validity = () => {
        const isEngSelected = [...engRadios].some(r => r.checked);
        const isCommSelected = [...commRadios].some(r => r.checked);
        btnS3Next.disabled = !(isEngSelected && isCommSelected);
    };

    engRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.engagementKey = e.target.value;
            checkS3Validity();
        });
    });

    commRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.communicationKey = e.target.value;
            checkS3Validity();
        });
    });

    btnS3Back.addEventListener('click', () => {
        transitionToScreen('processes', false);
    });

    btnS3Next.addEventListener('click', () => {
        transitionToScreen('gate');
    });

    // EKRAN 4: Wyniki (Bramka leadowa)
    const leadForm = document.getElementById('lead-form');
    const leadEmail = document.getElementById('lead-email');
    const leadEmailError = document.getElementById('lead-email-error');
    const btnS4Back = document.getElementById('btn-screen-4-back');

    leadEmail.addEventListener('input', () => {
        validateEmailField(leadEmail, leadEmailError);
    });

    btnS4Back.addEventListener('click', () => {
        transitionToScreen('people', false);
    });

    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateEmailField(leadEmail, leadEmailError)) {
            return;
        }

        state.leadInfo.name = document.getElementById('lead-name').value;
        state.leadInfo.email = leadEmail.value;
        state.leadInfo.role = document.getElementById('lead-role').value;

        runCalculationsAndShowResults();
    });

    // STRONA WYNIKOWA
    const btnResultsReset = document.getElementById('btn-results-reset');
    const btnFinalCta = document.getElementById('btn-final-cta');

    btnResultsReset.addEventListener('click', () => {
        resetCalculator();
    });

    btnFinalCta.addEventListener('click', () => {
        console.log('%c[NAIS LEAD MAGNET] CTA kliknięte dla leada:', 'color: #108a00; font-weight: bold;', state);
        alert(`Dziękujemy! Twój wniosek o bezpłatną konsultację został przekazany do doradcy NAIS. Skontaktujemy się z Tobą na adres: ${state.leadInfo.email} w ciągu 2 dni roboczych.`);
    });

    // LANDING PAGES CTA BUTTONS
    const btnLandingCfoCta = document.getElementById('btn-landing-cfo-cta');
    const btnLandingHrCta = document.getElementById('btn-landing-hr-cta');

    if (btnLandingCfoCta) {
        btnLandingCfoCta.addEventListener('click', () => {
            transitionToScreen('company');
        });
    }

    if (btnLandingHrCta) {
        btnLandingHrCta.addEventListener('click', () => {
            transitionToScreen('company');
        });
    }
}

// Funkcja walidacji adresu e-mail
function validateEmailField(inputElement, errorElement) {
    const email = inputElement.value.trim();
    
    if (email === '') {
        errorElement.innerText = 'Adres e-mail jest wymagany.';
        inputElement.style.borderColor = '#ea384c';
        return false;
    }
    
    // Prosta walidacja formatu e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorElement.innerText = 'Wpisz poprawny format adresu e-mail.';
        inputElement.style.borderColor = '#ea384c';
        return false;
    }
    
    // Walidacja domeny publicznej (lead B2B)
    const domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();
    if (publicEmailDomains.includes(domain)) {
        errorElement.innerText = 'Wymagany jest służbowy adres e-mail (odrzucamy domeny publiczne, np. gmail.com, wp.pl).';
        inputElement.style.borderColor = '#ea384c';
        return false;
    }
    
    // Sukces
    errorElement.innerText = '';
    inputElement.style.borderColor = 'var(--primary)';
    return true;
}

// Funkcja obslugujaca przejscia miedzy ekranami z animacja i aktualizacja paska postepu
function transitionToScreen(targetScreenId, recordHistory = true) {
    // 1. Zapisujemy historie nawigacji
    if (recordHistory) {
        const currentActive = Object.keys(screens).find(key => screens[key].classList.contains('active'));
        if (currentActive && currentActive !== targetScreenId) {
            navigationHistory.push(currentActive);
        }
    } else {
        // Jesli idziemy wstecz, cofamy sie w historii
        if (navigationHistory.length > 0) {
            navigationHistory.pop();
        }
    }

    // 2. Wylaczamy wszystkie ekrany
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });

    // 3. Wlaczamy wybrany ekran
    if (screens[targetScreenId]) {
        screens[targetScreenId].classList.add('active');
    }

    // Scrollujemy do gory app-container
    document.querySelector('.app-container').scrollIntoView({ behavior: 'smooth' });

    // 4. Aktualizujemy pasek postepu
    updateProgressBar(targetScreenId);
}

// Funkcja aktualizacji paska postepu w zaleznosci od ekranu
function updateProgressBar(screenId) {
    const indicators = {
        'company': 1,
        'processes': 2,
        'people': 3,
        'gate': 4,
        'loading': 4,
        'results': 4
    };

    const currentStep = indicators[screenId];
    const appHeader = document.querySelector('.app-header');

    if (screenId === 'landingCfo' || screenId === 'landingHr') {
        if (progressWrapper) progressWrapper.style.display = 'none';
        if (appHeader) appHeader.style.display = 'none';
        return;
    }

    if (screenId === 'disqualified') {
        if (progressWrapper) progressWrapper.style.display = 'none';
        if (appHeader) appHeader.style.display = 'flex';
        return;
    }

    if (progressWrapper) progressWrapper.style.display = 'block';
    if (appHeader) appHeader.style.display = 'flex';

    const stepElements = [
        { el: document.getElementById('step-1-indicator'), stepNum: 1 },
        { el: document.getElementById('step-2-indicator'), stepNum: 2 },
        { el: document.getElementById('step-3-indicator'), stepNum: 3 },
        { el: document.getElementById('step-4-indicator'), stepNum: 4 }
    ];

    stepElements.forEach(item => {
        if (item.el) {
            item.el.classList.remove('active', 'completed');
            
            if (item.stepNum === currentStep) {
                item.el.classList.add('active');
            } else if (item.stepNum < currentStep) {
                item.el.classList.add('completed');
            }
        }
    });
}

// Funkcja detekcji wariantów Landing Page na podstawie URL
function detectLandingPage() {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    // Sprawdzenie wariantu CFO/CEO
    const isCfo = path.includes('efektywnosc-kosztowa') || 
                  hash.includes('efektywnosc-kosztowa') || 
                  search.includes('variant=cfo') ||
                  search.includes('utm_campaign=efektywnosc-kosztowa');

    // Sprawdzenie wariantu HR Decydentów
    const isHr = path.includes('efektywnosc-hr') || 
                 hash.includes('efektywnosc-hr') || 
                 search.includes('variant=hr') ||
                 search.includes('utm_campaign=efektywnosc-hr');

    if (isCfo) {
        transitionToScreen('landingCfo');
    } else if (isHr) {
        transitionToScreen('landingHr');
    } else {
        // Domyślny start (krok 1)
        transitionToScreen('company');
    }
}

// Logika symulacji obliczen i wyswietlania wyników
function runCalculationsAndShowResults() {
    transitionToScreen('loading');

    // Mockowanie animacji procesowania danych w celu uwiarygodnienia
    const step1 = document.getElementById('load-step-1');
    const step2 = document.getElementById('load-step-2');
    const step3 = document.getElementById('load-step-3');

    // Reset klas krokow
    [step1, step2, step3].forEach(step => {
        step.className = 'pending';
    });

    setTimeout(() => {
        step1.className = 'done';
        step2.className = 'active';
    }, 600);

    setTimeout(() => {
        step2.className = 'done';
        step3.className = 'active';
    }, 1200);

    setTimeout(() => {
        step3.className = 'done';
    }, 1800);

    setTimeout(() => {
        calculateAndRender();
        transitionToScreen('results');
    }, 2200);
}

// Metoda formatowania waluty (np. 120 000)
function formatCurrency(value) {
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Metoda do formatowania godzin (np. 1 200)
function formatHours(value) {
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Wykonanie glownych obliczen
function calculateAndRender() {
    const empConfig = employeeRanges[state.employeeRangeKey];
    const salConfig = salaryRanges[state.salaryRangeKey];
    const indConfig = industries[state.industryKey];
    const engConfig = engagementLevels[state.engagementKey];
    const commConfig = communicationLevels[state.communicationKey];

    // Pobranie danych wejsciowych ze stanu
    const N = empConfig.N;
    const HR_ops = empConfig.HR_ops;
    const V = empConfig.V;
    const W = salConfig.W;
    const W_hr = W * 1.35;
    const P = state.paperPercentage / 100;
    const E = engConfig.E;
    const U = commConfig.U;

    // --- OBSZAR 1: Oszczednosc czasu pracownikow (wnioski) ---
    // Delta czasu na wniosek: 12 minut
    const oszczednosc_min = N * V * P * 12;
    const oszczednosc_h_A1 = oszczednosc_min / 60;
    const stawka_min = W / (168 * 60);
    const wartosc_A1 = oszczednosc_min * stawka_min;

    // --- OBSZAR 2: Oszczednosc czasu zespołu HR ---
    const godziny_admin_tyg = HR_ops * 10;
    const redukcja = 0.65;
    const oszczednosc_h_A2 = godziny_admin_tyg * redukcja * 48;
    const wartosc_A2 = oszczednosc_h_A2 * (W_hr / 168);

    // --- ŁĄCZENIE WYNIKÓW (Sekcja A) ---
    const laczna_h = oszczednosc_h_A1 + oszczednosc_h_A2;
    let wartosc_laczna = wartosc_A1 + wartosc_A2;
    let per_pracownik = wartosc_laczna / N;

    // Zabezpieczenie wiarygodnosci (Capping)
    let isCapped = false;
    if (per_pracownik > W * 2.5) {
        per_pracownik = W * 2.0;
        wartosc_laczna = per_pracownik * N;
        isCapped = true;
    }

    // --- RENDERING SEKCJI A ---
    // Godziny: zaokraglone do 100
    const roundedHours = Math.round(laczna_h / 100) * 100;
    document.getElementById('res-hours').innerHTML = `<div class="single-value-display">${formatHours(roundedHours)}</div>`;

    // PLN / pracownik: zakres ±20%
    const perEmpMin = Math.round((per_pracownik * 0.8) / 10) * 10;
    const perEmpMax = Math.round((per_pracownik * 1.2) / 10) * 10;
    document.getElementById('res-per-employee').innerHTML = `
        <div class="range-vertical">
            <div class="range-row"><span class="range-label">od</span> <span class="range-num">${formatCurrency(perEmpMin)}</span> <span class="range-unit">PLN</span></div>
            <div class="range-row"><span class="range-label">do</span> <span class="range-num">${formatCurrency(perEmpMax)}</span> <span class="range-unit">PLN</span></div>
        </div>
    `;

    // Łączna korzyść finansowa rocznie: zakres ±20% (zaokraglone do pelnych tysiecy dla czytelnosci)
    const totalMin = Math.round((wartosc_laczna * 0.8) / 1000) * 1000;
    const totalMax = Math.round((wartosc_laczna * 1.2) / 1000) * 1000;
    document.getElementById('res-total').innerHTML = `
        <div class="range-vertical">
            <div class="range-row"><span class="range-label">od</span> <span class="range-num">${formatCurrency(totalMin)}</span> <span class="range-unit">PLN</span></div>
            <div class="range-row"><span class="range-label">do</span> <span class="range-num">${formatCurrency(totalMax)}</span> <span class="range-unit">PLN</span></div>
        </div>
    `;

    // Przypis o cappingu
    const capWarning = document.getElementById('capped-warning');
    if (isCapped) {
        capWarning.classList.remove('hidden');
    } else {
        capWarning.classList.add('hidden');
    }

    // --- RENDERING SEKCJI B (Korzyści orientacyjne) ---
    // 1. Wzrost zaangażowania
    const E_docelowe = Math.min(E + 0.05, 0.75);
    const delta_E_pp = Math.round((E_docelowe - E) * 100);
    const wzrost_prod = (E_docelowe - E) * 0.18;
    const wartosc_A3 = N * W * 12 * wzrost_prod;

    document.getElementById('res-delta-e').innerText = delta_E_pp;

    // 2. Realizacja polityki benefitowej
    const delta_U = 0.925 - U; // Benchmark Nais to 92.5% (0.925)
    const delta_U_pct = Math.round(delta_U * 100);
    
    document.getElementById('res-delta-u').innerText = delta_U_pct;
    document.getElementById('res-current-u').innerText = Math.round(U * 100);

    // Zapisujemy pelne dane do logowania
    const calculations = {
        oszczednosc_h_A1,
        wartosc_A1,
        oszczednosc_h_A2,
        wartosc_A2,
        laczna_h,
        wartosc_laczna,
        per_pracownik,
        isCapped,
        delta_E_pp,
        wartosc_A3,
        delta_U_pct
    };

    console.log('%c[NAIS LEAD MAGNET] Dane wejściowe kalkulatora:', 'color: #293658; font-weight: bold;', {
        N, HR_ops, V, W, W_hr, P, E, U
    });
    console.log('%c[NAIS LEAD MAGNET] Wyliczenia matematyczne:', 'color: #293658; font-weight: bold;', calculations);
}

// Resetowanie kalkulatora do stanu poczatkowego
function resetCalculator() {
    state = {
        employeeRangeKey: null,
        salaryRangeKey: null,
        industryKey: null,
        paperPercentage: null,
        engagementKey: null,
        communicationKey: null,
        leadInfo: {
            name: '',
            email: '',
            role: ''
        }
    };
    navigationHistory = [];

    // Resetowanie pól formularzy
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
    document.getElementById('industry-select').value = '';
    document.getElementById('disq-name').value = '';
    document.getElementById('disq-email').value = '';
    document.getElementById('disq-gdpr').checked = false;
    document.getElementById('lead-name').value = '';
    document.getElementById('lead-email').value = '';
    document.getElementById('lead-role').value = '';
    document.getElementById('lead-gdpr').checked = false;
    
    document.getElementById('disq-email-error').innerText = '';
    document.getElementById('disq-email').style.borderColor = 'var(--border-light)';
    document.getElementById('lead-email-error').innerText = '';
    document.getElementById('lead-email').style.borderColor = 'var(--border-light)';

    // Resetowanie slidera
    document.getElementById('paper-processes-slider').value = 45;
    document.getElementById('slider-percentage-value').innerText = 45;

    // Przejscie do pierwszego ekranu
    transitionToScreen('company');
}
