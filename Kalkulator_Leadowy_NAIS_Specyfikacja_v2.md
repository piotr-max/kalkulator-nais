# Kalkulator leadowy NAIS — specyfikacja kompletna v2.0

---

## CEL I ZASADA NADRZĘDNA

Kalkulator generuje leady B2B. Jedynym jego zadaniem jest skłonienie HR-owca lub menedżera do zostawienia maila. Wynik jest zaproszeniem do rozmowy, nie raportem. Użytkownik odpowiada intuicyjnie w ~2 minuty — kalkulator zamienia te przybliżenia w wiarygodne liczby, opierając się na benchmarkach 200+ klientów NAIS.

---

## ARCHITEKTURA — 4 ekrany + bramka + wynik

```
EKRAN 1 — Twoja firma
  └─ jeśli <1000 pracowników → EKRAN DYSKWALIFIKACJI
  └─ jeśli ≥1000 pracowników → kontynuacja

EKRAN 2 — Procesy HR
  └─ jeden slider: % procesów papierowych

EKRAN 3 — Ludzie i komunikacja
  └─ zaangażowanie (4 kafelki) + komunikacja firmy (3 kafelki)

EKRAN 4 — Bramka leadowa
  └─ imię · służbowy e-mail · stanowisko

STRONA WYNIKOWA
  ├─ SEKCJA A — 3 liczby policzalne
  ├─ SEKCJA B — korzyści korporacyjne (orientacyjne)
  └─ SEKCJA C — CTA
```

---

## EKRAN 1 — Twoja firma

### Pole 1 — Liczba pracowników

Kafelki do kliknięcia. Wybór natychmiast wyzwala walidację.

| Kafelek          | Wartość N do kalkulacji | Akcja                    |
|------------------|------------------------|--------------------------|
| Poniżej 1 000    | —                      | → ekran dyskwalifikacji  |
| 1 000 – 5 000    | 2 500                  | → kontynuacja            |
| 5 000 – 10 000   | 7 500                  | → kontynuacja            |
| 10 000 – 20 000  | 15 000                 | → kontynuacja            |
| 20 000 – 40 000  | 30 000                 | → kontynuacja            |
| 40 000 – 100 000 | 70 000                 | → kontynuacja            |

---

### EKRAN DYSKWALIFIKACJI — wyświetlany wyłącznie dla „Poniżej 1 000"

**Nagłówek:**
> „Ta kalkulacja działa dla firm powyżej 1 000 pracowników"

**Treść:**
> „Przepraszamy — w mniejszych organizacjach statystyczne benchmarki, na których opieramy kalkulację, przestają działać wiarygodnie. Każda firma poniżej tego progu jest zbyt unikalna, żeby liczby miały sens bez rozmowy.
>
> Ale to nie znaczy, że nie możemy Ci pomóc. Nasz konsultant przeprowadzi analizę indywidualnie — na podstawie Twoich rzeczywistych danych, nie uśrednień."

**CTA:** [Umów indywidualną rozmowę →]

Pod przyciskiem: „Bezpłatnie. Bez zobowiązań. Odpiszemy w ciągu jednego dnia roboczego."

Formularz: tylko imię + służbowy e-mail. Krótszy niż główna bramka — celowo.

---

### Pole 2 — Wynagrodzenia na tle średniej krajowej

Punkt odniesienia: średnia krajowa brutto GUS 2025 ~8 000 PLN — niewidoczny dla użytkownika.

| Kafelek                         | Opis pomocniczy              | Proxy W [PLN brutto/mies.] |
|---------------------------------|------------------------------|---------------------------|
| Wyraźnie poniżej średniej       | ok. −30% lub więcej          | 5 600                     |
| Mniej więcej na poziomie średniej | ±10% od średniej krajowej  | 8 000                     |
| Powyżej średniej                | ok. +30%                     | 10 400                    |
| Wyraźnie powyżej średniej       | ok. +60% i więcej            | 13 000                    |

W_hr = W × 1,35 — wynagrodzenie specjalisty HR (wewnętrzne, niewidoczne dla użytkownika).

---

### Pole 3 — Branża

Dropdown, 8 opcji + „Inna". Uruchamia benchmark rotacji używany w kalkulacji Obszaru 3.

| Branża                                | Benchmark rotacji |
|---------------------------------------|------------------|
| Produkcja i przemysł                  | 18%              |
| Handel i logistyka                    | 24%              |
| Energetyka i utilities                | 10%              |
| Usługi finansowe i ubezpieczenia      | 13%              |
| IT i technologie                      | 16%              |
| Ochrona zdrowia i farmacja            | 20%              |
| Handel detaliczny                     | 26%              |
| Inna                                  | 17%              |

---

## EKRAN 2 — Procesy HR

Jeden slider. Jeden ekran.

**Pytanie:** „Jaka część procesów HR odbywa się u Was papierowo lub przez e-mail?"

Slider 0–100%, krok 10%.

**Prefill wg N:**

| Przedział N       | Prefill P |
|-------------------|-----------|
| 1 000 – 5 000     | 45%       |
| 5 000 – 10 000    | 35%       |
| 10 000 – 20 000   | 28%       |
| 20 000 – 40 000   | 22%       |
| 40 000 – 100 000  | 18%       |

Pod sliderem: „Firmy podobnej wielkości obsługują średnio X% procesów HR jeszcze papierowo — dane z 200+ wdrożeń NAIS."

**Zmienne HR_ops i V nie są pytane** — kalkulator podstawia je automatycznie jako benchmarki wg N:

| Przedział N       | HR_ops (domyślne) | V — wnioski/FTE/rok |
|-------------------|-------------------|---------------------|
| 1 000 – 5 000     | 4                 | 20                  |
| 5 000 – 10 000    | 8                 | 20                  |
| 10 000 – 20 000   | 15                | 18                  |
| 20 000 – 40 000   | 28                | 18                  |
| 40 000 – 100 000  | 65                | 16                  |

---

## EKRAN 3 — Ludzie i komunikacja

### Pole 1 — Jak oceniasz zaangażowanie pracowników w Twojej firmie?

| Kafelek                    | Opis pomocniczy                                                                      | E — % zaangażowanych        |
|----------------------------|--------------------------------------------------------------------------------------|-----------------------------|
| Wysokie                    | Większość jest zmotywowana, mało rotacji, ludzie polecają firmę jako pracodawcę      | 55%                         |
| Przeciętne                 | Część pracowników robi minimum — „odsiedzieć i wyjść". Rotacja na poziomie rynkowym | 30%                         |
| Niskie                     | Czuć zniechęcenie, dużo rotacji, rekrutacja jest trudna                              | 15%                         |
| Nie wiem / nie mierzyliśmy | —                                                                                    | 23% (benchmark Gallup 2025) |

### Pole 2 — Jak oceniasz komunikację firmy z pracownikami?

| Kafelek    | Opis pomocniczy                                                                              | U — wykorzystanie benefitów |
|------------|----------------------------------------------------------------------------------------------|-----------------------------|
| Dobra      | Pracownicy wiedzą, co im przysługuje i korzystają. Mało pytań, mało nieporozumień            | 78%                         |
| Przeciętna | Część informacji nie dociera. Świadczenia przepadają, bo ludzie nie wiedzą jak z nich korzystać | 58%                      |
| Słaba      | Dużo pytań, skargi że „firma nic nie informuje", powtarzające się nieporozumienia            | 38%                         |

---

## EKRAN 4 — Bramka leadowa

**Lead-in nad formularzem:**
> „Twoja analiza jest gotowa. Zostaw dane — konsultant NAIS prześle Ci pełny raport z wyliczeniami w ciągu jednego dnia roboczego."

**Pola:**
- Imię i nazwisko [wymagane]
- Służbowy adres e-mail [wymagane — walidacja: brak @gmail, @wp, @o2 itp.]
- Stanowisko [dropdown: Dyrektor / Specjalista HR · CEO / CFO / Zarząd · Menedżer · Inne]

**Przycisk:** „Pokaż mi wyniki →"

---

## LOGIKA KALKULACJI

### Symbole

```
N       = liczba pracowników (środek przedziału z kafelka)
HR_ops  = liczba osób HR w obsłudze (benchmark wg N — niewidoczny)
V       = wnioski/FTE/rok (benchmark wg N — niewidoczny)
W       = proxy wynagrodzenia pracownika/mies. (z kafelka wynagrodzeń)
W_hr    = W × 1,35
P       = % papierowych procesów (ze slidera, jako ułamek 0–1)
E       = % zaangażowanych (z kafelka zaangażowania)
U       = wskaźnik wykorzystania benefitów (z kafelka komunikacji)
U_nais  = 0,925  (benchmark NAIS: 91–95% utilizacji)
```

---

### Obszar 1 — Oszczędność czasu pracowników (obsługa wniosków)

```
czas_tradycyjny  = 14 min / wniosek
czas_nais        =  2 min / wniosek
Δ_czas           = 12 min / wniosek

oszczędność_min  = N × V × P × 12
oszczędność_h_A1 = oszczędność_min / 60
stawka_min       = W / (168 × 60)
wartość_A1       = oszczędność_min × stawka_min
```

Mnożnik P: redukcja dotyczy tylko procesów jeszcze papierowych.

---

### Obszar 2 — Oszczędność czasu zespołu HR

```
godziny_admin_tyg = HR_ops × 10 h
redukcja          = 0,65
oszczędność_h_A2  = godziny_admin_tyg × 0,65 × 48
wartość_A2        = oszczędność_h_A2 × (W_hr / 168)
```

---

### Wynik policzalny — do Sekcji A

```
łączna_h       = oszczędność_h_A1 + oszczędność_h_A2
wartość_łączna = wartość_A1 + wartość_A2
per_pracownik  = wartość_łączna / N

// Zabezpieczenie wiarygodności
jeśli per_pracownik > W × 2,5:
    cap: per_pracownik = W × 2,0
    dodaj przypis pod wynikiem
```

Kwoty zawsze jako przedział ±20%.

---

### Obszar 3 — Wzrost zaangażowania — do Sekcji B (orientacyjny)

```
E_docelowe  = min(E + 0,05, 0,75)
Δ_E_pp      = round((E_docelowe − E) × 100)    → „nawet o X pp"
wzrost_prod = (E_docelowe − E) × 0,18
wartość_A3  = N × W × 12 × wzrost_prod         → przedział ±30%
```

---

### Obszar 4 — Poprawa realizacji polityki benefitowej — do Sekcji B (orientacyjny)

```
Δ_U      = 0,925 − U
Δ_U_pct  = round(Δ_U × 100)                    → „nawet o Y%"
wartość_B = N × W × 0,08 × 12 × Δ_U            → przedział ±30%
```

---

## STRONA WYNIKOWA

### Nagłówek

> „Oto co traci Twoja firma — i co możesz odzyskać"

Podtytuł: „Kalkulacja oparta na Twoich odpowiedziach i danych 200+ firm korzystających z NAIS."

Zero oklasków. Zero trofeów. Żadnego „Gratulacje!".

---

### SEKCJA A — Trzy liczby policzalne

Trzy karty, każda z jedną dominującą liczbą. Kolejność celowa — od łatwej do wyobrażenia do imponującej skali.

| Karta            | Liczba                                              | Opis                                             |
|------------------|-----------------------------------------------------|--------------------------------------------------|
| Godziny          | round(łączna_h / 100) × 100                        | rocznie odzyskujecie na obsłudze HR i wniosków   |
| PLN / pracownik  | round(per_pracownik / 100) × 100                   | roczna korzyść w przeliczeniu na jedną osobę     |
| PLN w skali roku | przedział [wartość_łączna × 0,8] – [× 1,2]         | łączna korzyść finansowa — szacunek              |

Pod kartami: „Kalkulacja obejmuje czas pracowników i HR zaoszczędzony na obsłudze wniosków i administracji — na podstawie benchmarków z 200+ wdrożeń NAIS."

---

### SEKCJA B — Korzyści korporacyjne

Szare tło — wizualnie oddzielone od twardych liczb.

**Nagłówek:** „Obok tych oszczędności firmy korzystające z NAIS raportują:"

**Punkt 1 — Wzrost zaangażowania**
> „Wzrost zaangażowania pracowników nawet o **Δ_E_pp punktów procentowych** — co według Gallup przekłada się na nawet 1–2% wyższą produktywność w skali firmy. Orientacyjna wartość dla Twojej organizacji: [wartość_A3 × 0,7] – [wartość_A3 × 1,3] PLN rocznie.
>
> Przyjmujemy wzrost zaangażowania o 5 pp dla pierwszego roku — pełny efekt zazwyczaj występuje po 2–3 latach, w zależności od firmy i tempa absorpcji zmiany."

Źródło: Gallup Q12 Meta-Analysis 2024, 2,7 mln pracowników.

**Punkt 2 — Poprawa realizacji polityki benefitowej**
> „Poprawa wykorzystania benefitów nawet o **Δ_U_pct%** — pracownicy klientów NAIS korzystają średnio z 91–95% przyznanych budżetów. Twoi pracownicy korzystają dziś szacunkowo z round(U × 100)%. Ten sam budżet — wyższy efekt motywacyjny."

**Punkt 3 — Lepsza komunikacja**
> „Redukcja powtarzających się pytań o 60–80%. Twój zespół HR zyskuje czas na działania strategiczne zamiast odpowiadania wciąż na te same wnioski."

---

### SEKCJA D — Gwarancje NAIS po 6 miesiącach wdrożenia

Wyróżniony blok — np. ramka z ikoną tarczy lub checklisty. Umieszczony bezpośrednio przed CTA, żeby ostatnie wrażenie przed przyciskiem było pewność, nie pytanie.

**Nagłówek:** „Co gwarantujemy po 6 miesiącach wdrożenia"

| Gwarancja | Rezultat | Co to oznacza dla Ciebie |
|---|---|---|
| Aktywacja użytkowników >80% | Ponad 4 na 5 pracowników korzysta z platformy | Eliminacja wykluczenia cyfrowego |
| Ponad 10 zelektronizowanych procesów wnioskowych i deklaracyjnych | Minimum 10 typów wniosków w pełni cyfrowych | Zero papierowych obiegów dla kluczowych procesów |
| Poprawność wniosków w systemie >99,5% | Praktycznie zero błędnych wniosków | Brak konieczności ręcznych poprawek przez HR |
| Automatyzacja rozliczeń benefitów, ZFŚS i dekretów płacowych 100% | Pełna automatyzacja rozliczeń | Koniec ręcznych przeliczeń i pomyłek w listach płac |
| Satysfakcja użytkowników >80% | Ponad 80% pracowników zadowolonych lub bardzo zadowolonych | Platforma, którą ludzie chcą używać |

Pod tabelą jedna linijka:
> „Jeśli którykolwiek z tych rezultatów nie zostanie osiągnięty — rozmawiamy. To nie jest obietnica marketingowa, to zobowiązanie wpisane w umowę."

---

### SEKCJA C — CTA

Wyróżnione tło — zgodnie z peak-end rule.

> „Nasz konsultant zweryfikuje te liczby na Twoich rzeczywistych danych i przygotuje dedykowany raport w ciągu 2 dni roboczych."

**[Umów bezpłatną konsultację →]**

Pod przyciskiem: „Dlatego ponad 200 firm — w tym z Twojej branży — wybrało NAIS do obsługi swoich pracowników."

---

## ZASADY UX — niezmienne

| Reguła                                          | Uzasadnienie                                                                   |
|-------------------------------------------------|--------------------------------------------------------------------------------|
| Bramka PRZED wynikami                           | 5/5 respondentów nie ufało wynikom, ale 5/5 umówiłoby konsultację             |
| Wszystkie pola mają prefill z benchmarku        | Użytkownik nie może utknąć na pustym polu                                      |
| Cofnięcie zawsze możliwe bez utraty danych      | Błąd kolejności pytań potwierdził 5/5 respondentów                             |
| Kwoty PLN zawsze jako przedział ±20%            | Przedział sygnalizuje szacunek, nie precyzję — eliminuje reakcję „ściema"      |
| Sekcja B wizualnie oddzielona od Sekcji A       | CFO nie może pomylić liczb policzalnych z orientacyjnymi                       |
| Brak ROI% gdziekolwiek                          | 4286% = utrata wiarygodności natychmiastowa                                    |
| Brak słowa „Gratulacje!"                        | Aktywnie odwraca motywację do kontaktu — potwierdzone 5/5                      |
