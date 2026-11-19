WIZMERO 0.6 MOBILE BETA · KK & Felix
==================================

CEL: przetestować tę samą aplikację na iPhonie i Androidzie,
z identyfikacją wizualną Wariant D, terminami, klientami, SMS,
godzinami pracy i kopią danych.

ZAWARTOŚĆ
- index.html, styles.css, app.js: aplikacja
- manifest.webmanifest, sw.js: instalacja na telefonie i offline
- assets/: ikony wariantu D

PUBLIKACJA NA GITHUB PAGES (TESTY)
1. Rozpakuj ZIP na komputerze.
2. Na github.com utwórz NOWE, PUBLICZNE repozytorium, np. wizmero-beta-test.
   Nie umieszczaj tu żadnych danych prawdziwych klientów!
3. W repozytorium wybierz Add file > Upload files i prześlij
   pliki i folder assets z rozpakowanej paczki. Ważne: index.html
   ma leżeć w katalogu głównym repozytorium, nie w podfolderze.
4. Settings > Pages > Build and deployment:
   Source: Deploy from a branch; Branch: main; Folder: /(root), Save.
5. Otwórz adres podany przez GitHub Pages, przykładowo:
   https://TWOJ_LOGIN.github.io/wizmero-beta-test/
   To jest wzór adresu, a nie opublikowany link do Wizmero.
6. iPhone: Safari > otwórz adres > Udostępnij > Dodaj do ekranu początkowego.
   Android: Chrome > otwórz adres > menu ⋮ > Zainstaluj aplikację
   lub Dodaj do ekranu głównego.
7. Odwiedź aplikację w sieci, później włącz tryb samolotowy
   i sprawdź, czy kalendarz otwiera się offline.

WAŻNE GRANICE TEJ WERSJI
- To wydanie testowe, tylko syntetyczne dane: Jan Nowak, Ola itd.
- Każdy telefon ma ODRĘBNĄ bazę, bez synchronizacji.
- Dane zapisują się lokalnie w IndexedDB przeglądarki/PWA.
  Ich trwałość może zależeć od ustawień telefonu i usunięcia aplikacji.
  Testujemy więc również kopię zapasową (Opcje).
- Kopia .wzm jest szyfrowana AES-GCM z hasłem (PBKDF2).
  Zapomnianego hasła nie da się odzyskać.
- Ustawienia SMS są personalizowane; naciśnięcie "Otwórz Wiadomości"
  próbuje otworzyć systemową aplikację SMS i przygotować treść.
  Na niektórych telefonach może otworzyć sam numer lub nie zadziałać.
  ZAPIS STATUSU "Wysłany" wymaga ręcznego potwierdzenia.
- Nie wysyłaj SMS-ów na przykładowe numery!
  Najpierw zmień numer klienta na swój, i tylko wtedy próbuj.
- Zmiany wizyt powiadomionych klientom tworzą osobną wiadomość SMS.
- Do zastosowania w prawdziwej firmie potrzebne są dalsze testy,
  audyt RODO/bezpieczeństwa, obsługa migracji i twardy backup.

PIERWSZE TESTY
A. Kalendarz -> 25.11.2026: Jan 12:30–13:00, Ola 13:00–14:00.
   12:00 na 30 minut jest dostępne; 12:00 na 60 min koliduje.
B. Rezerwacja: wybierz godzinę, potem czas, dane klienta.
   Po wpisaniu '98765' numer telefonu podpowie Jana Nowaka.
C. Zmiana godzin pracy: ustaw zajęty dzień jako wolny,
   istniejąca wizyta nie powinna zniknąć.
D. SMS: zmień szablon w Opcjach, potem Przypomnienia.
E. Zrób szyfrowaną kopię .wzm i przywróć ją na tym samym telefonie.
F. Sprawdź czy po zamknięciu i ponownym otwarciu aplikacji dane zostały.

PROBLEM? Zachowaj zrzut ekranu i napisz, jaki telefon, system,
przeglądarka i czynności prowadziły do błędu.
