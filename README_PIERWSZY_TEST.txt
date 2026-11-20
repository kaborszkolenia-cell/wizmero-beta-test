WIZMERO 0.8 MOBILE BETA · by KK & Felix
---------------------------------------

CO NOWEGO W 0.8
• Widok dnia to jedna czytelna oś czasu z wolnymi godzinami i wizytami pośrodku.
• Zapisana wizyta zajmuje dokładnie swój przedział: 12:30–13:00, a nie całą godzinę.
• Nowa wizyta i Edytuj otwierają ten sam wysuwany panel nad kalendarzem.
• Godzinę rozpoczęcia i zakończenia możesz skorygować przyciskami +/− co 5 minut,
  albo wpisać 24-godzinną godzinę jako GG:MM (np. 09:25, ewentualnie 0925).
• Zmiana początku przesuwa zakończenie, zachowując długość wizyty.
• Małe wolne okienko, np. 09:15–09:25, jest dostępne i podpowiada 10 minut.
• W formularzu otworzysz „Moi klienci”, bez opuszczania okna wizyty.
• W bazie „Moi klienci” przycisk „Umów wizytę” uzupełnia dane wybranego klienta.
• Przełożenie wizyty wymaga teraz potwierdzenia w tym samym formularzu.
• Dotychczasowy ekran główny, logo wariant D, Opcje, SMS i kopie danych pozostają.

PRZED AKTUALIZACJĄ Z 0.7
1. Nie usuwaj aplikacji z telefonu i nie czyść danych przeglądarki.
2. W 0.7 otwórz Opcje > Kopia zapasowa. Pobierz zaszyfrowaną kopię i zapisz hasło
   w bezpiecznym miejscu. Przygotowanie kopii przed aktualizacją jest obowiązkową
   ostrożnością testową.
3. Wgranie 0.8 do tego SAMEGO repozytorium zachowuje adres witryny oraz nazwę
   lokalnej bazy IndexedDB. Powinno zachować dotychczasowe dane, ale musimy to
   jeszcze potwierdzić podczas testu na Twoim telefonie.

JAK OPUBLIKOWAĆ
1. Rozpakuj ZIP na komputerze.
2. Otwórz https://github.com/kaborszkolenia-cell/wizmero-beta-test
3. Add file > Upload files, prześlij WSZYSTKIE pliki i folder assets ze środka paczki,
   a następnie zatwierdź zmiany.
4. Sprawdź, czy w repozytorium index.html, app.js, styles.css i sw.js są w katalogu głównym.
5. Po zielonym statusie GitHub Pages otwórz na telefonie ten sam adres:
   https://kaborszkolenia-cell.github.io/wizmero-beta-test/
6. Jeśli pojawia się stara wersja, zamknij aplikację i uruchom ponownie online.
   Nowy service worker może uaktywnić się dopiero po kolejnym otwarciu.

PROPONOWANE TESTY
• 25.11: Jan 12:30–13:00, Ola 13:00–14:00; 12:00–12:30 wolne, 12:00–13:00 koliduje.
• Na 24.11 zapisz 08:05–09:15 i 09:25–10:25.
• Sprawdź korektę godzin i zmianę czasu w wyskakującym oknie.
• Test: krótka przerwa 09:15–09:25 pozwala rozpocząć wizytę na 10 minut.
• Test: wyszukaj Jana po 98765 w „Moi klienci” podczas umawiania wizyty.
• Test: „Umów wizytę” na karcie klienta, a następnie edytuj i przełóż wizytę.
• Zamknij aplikację, uruchom ponownie i sprawdź, czy wizyty oraz klienci pozostały.
• Sprawdź wygląd panelu na Androidzie, a następnie na iPhonie.
• SMS testuj WYŁĄCZNIE na własny numer telefonu.

OGRANICZENIA
To nadal beta do testów z fikcyjnymi klientami. Nie przechowuj rzeczywistych
numerów i danych klientów. Nie ma automatycznej wysyłki SMS i brak potwierdzenia
doręczenia. Kopia eksportowana jest szyfrowana hasłem, ale dane na urządzeniu
nie są obecnie zaszyfrowane przez samą aplikację.
