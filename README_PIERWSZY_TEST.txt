WIZMERO 0.8.2 MOBILE BETA · by KK & Felix
========================================

NOWOŚĆ: JEDNORAZOWE PRZERWY / BLOKADY CZASU
- Wybierz dzień w „Mój terminarz” i kliknij „+ Zablokuj czas”.
- Ustal początek i koniec przerwy co 5 minut, przyciskami + / − lub wpisując GG:MM.
- Opcjonalnie wpisz opis, np. „Obiad”, „Spacer”, „Sprawy prywatne”.
- Zatwierdź „Zapisz przerwę”. Przerwa pojawi się na osi dnia między wizytami.
- Na bloku przerwy użyj „Edytuj”, aby zmienić godziny lub opis.
- Użyj „Usuń przerwę” i potwierdź, aby znów udostępnić ten czas klientom.
- Przerwy blokują kolizje z rezerwacjami i z innymi przerwami.
- Przerwa nie tworzy nowego klienta, nie wysyła i nie przygotowuje SMS.
- Kolor dnia uwzględnia przerwy i ustawiony minimalny czas wizyty.
- Wolne 5 + 5 minut rozdzielone przerwą nadal nie oznacza wolnego terminu 10 minut.

BEZ ZMIAN W STOSUNKU DO 0.8.1
- Wybrana nazwa, slogan, logo D, dwa granaty i ekran główny.
- Klienci, rezerwacje, edycja i przenoszenie wizyt, SMS-y, personalizowane szablony.
- Chronologiczny terminarz dzienny, wysuwany formularz i edycja godzin co 5 minut.
- Opcje -> Minimalny czas wizyty (10 / 15 / 20 / 30 min).
- Ta sama nazwa bazy IndexedDB oraz schemat danych nr 1.
- Stare dane i kopie 0.8.1 bez pola „breaks” otrzymują pustą listę przerw.
- Przerwy zapisują się razem z danymi w szyfrowanej kopii zapasowej.

AKTUALIZACJA Z 0.8.1
1. ZANIM wgrasz nową paczkę, w działającym Wizmero 0.8.1 otwórz
   Opcje -> Kopia zapasowa, pobierz szyfrowaną kopię i zachowaj hasło.
2. Nie usuwaj ikony/aplikacji z telefonu i nie czyść danych przeglądarki.
3. Rozpakuj ZIP na komputerze.
4. Otwórz https://github.com/kaborszkolenia-cell/wizmero-beta-test
5. Add file -> Upload files: wgraj WSZYSTKIE pliki z wnętrza paczki
   i folder assets, zastępując poprzednie pliki. Zatwierdź zmiany.
6. W katalogu głównym repozytorium powinny leżeć index.html, app.js,
   styles.css, sw.js i manifest.webmanifest. Nie wgrywaj samego ZIP.
7. Po zakończeniu publikacji GitHub Pages otwórz na telefonie ten sam adres:
   https://kaborszkolenia-cell.github.io/wizmero-beta-test/
8. Jeśli widać starą wersję, zamknij i ponownie uruchom aplikację online.
   Aktualizacja pamięci offline (service worker) może wymagać kolejnego otwarcia.

TESTY TELEFONICZNE
A. 25.11.2026: spróbuj zablokować 12:00–14:00.
   Zapis powinien być zablokowany z powodu wizyt Jana i Oli.
B. Ten sam dzień: zablokuj 10:00–12:00, opis „Spacer z dzieckiem”.
   Sprawdź wpis na osi czasu, a także blokadę wizyty 11:00–11:30.
C. Edytuj przerwę na 10:05–12:05. Zamknij aplikację i otwórz ponownie:
   przerwa powinna pozostać.
D. Usuń przerwę z potwierdzeniem. Wolne godziny powinny wrócić.
E. Skróć wybrany dzień roboczy do 08:00–10:00 i zablokuj cały przedział:
   dzień powinien być czerwony. Zmień przerwę na 08:05–09:55:
   nadal czerwony, bo po bokach zostaje tylko 5 + 5 minut.
F. Sprawdź, czy baza klientów, stare wizyty i ustawienia pozostały.
G. Przypomnienia SMS testuj WYŁĄCZNIE na swoim numerze.

CO JUŻ SPRAWDZONO
Automatyczne testy interfejsu Chromium: tworzenie, kolizje, edycja,
usunięcie i zmiana koloru dnia – zaliczone. Regresja minimum 10/15 min,
zapisu krótkich wizyt i 5+5 minut – zaliczona. Testy migracji i zapisu
w symulowanym magazynie danych – zaliczone. Faktyczne zachowanie bazy
IndexedDB po aktualizacji na iPhonie/Androidzie nadal do weryfikacji.

OGRANICZENIA
BETA: używaj wyłącznie fikcyjnych danych. Baza lokalna nie jest
szyfrowana przez samą aplikację, a kopie eksportowane są szyfrowane.
Nie ma automatycznej wysyłki ani potwierdzenia doręczenia SMS.
Przed wprowadzeniem prawdziwych klientów potrzebujemy dalszych testów
bezpieczeństwa, przechowywania i przywracania danych oraz RODO.
