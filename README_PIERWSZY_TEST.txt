WIZMERO 0.7 MOBILE BETA — KK & FELIX

NOWOŚCI
1. Kalendarz: oś dnia z wolnymi przedziałami oraz zajętymi wizytami.
2. Każda rezerwacja pokazuje pełny przedział: 12:30–13:00 Jan Nowak, 13:00–14:00 Ola.
3. Edycja rezerwacji, przełożenie i odwołanie bezpośrednio z osi dnia.
4. Przy tworzeniu/edycji, po wskazaniu godziny, początek i koniec można korygować co 5 minut.
5. „Moi klienci” w formularzu: lista i wyszukiwanie, wybór osoby bez pamiętania nazwy.
6. „Umów wizytę” obok „Edytuj” na karcie każdego klienta.

WAŻNE: przed aktualizacją z 0.6 zrób szyfrowaną kopię danych na telefonie (Opcje).
Aktualizacja działa na tej samej nazwie lokalnej bazy IndexedDB i nie powinna usuwać danych 0.6.
Nie zmieniaj adresu strony na nową domenę, bo dane lokalne są powiązane z origin.

PUBLIKACJA NA ISTNIEJĄCYM REPOZYTORIUM
1. Wejdź do repozytorium wizmero-beta-test na GitHubie.
2. Add file > Upload files. Przeciągnij WSZYSTKIE pliki i katalog assets z tej paczki.
3. Potwierdź nadpisanie istniejących plików (GitHub) i zapisz commit.
4. Poczekaj na zielony status GitHub Pages w Actions.
5. Otwórz ten sam adres https://kaborszkolenia-cell.github.io/wizmero-beta-test/
6. Jeśli widać starą wersję, zamknij aplikację, otwórz ponownie online; w razie potrzeby zamknij ponownie po załadowaniu nowego Service Workera.

TESTY
- 25.11: Jan 12:30–13:00 oraz Ola 13:00–14:00.
- Spróbuj rezerwacji 12:00–12:30 (OK), następnie 12:00–13:00 (kolizja).
- Nowa wizyta 08:05–09:15 i kolejna 09:25–10:25.
- Przycisk Moi klienci w formularzu; Umów wizytę z listy klientów.
- Edytuj zapisany termin bez tworzenia drugiej rezerwacji.
- Sprawdź trwałość danych po zamknięciu i ponownym otwarciu.
- Sprawdź SMS tylko na własny numer.

TO JEST BETA: używaj tylko fikcyjnych klientów. PWA nie potwierdza wysłania SMS, tylko ręczne potwierdzenie.
