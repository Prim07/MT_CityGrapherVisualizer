# CityGrapher Visualizer

https://cg-visualizer.herokuapp.com/

## PL

Aplikacja dostępna jest pod linkiem u góry. Heroku jest darmowym narzędziem i potrzebuje chwili, aby się wybudzić. W razie problemów proszę o kontakt.

Niektóre miasta mogą nie dzialać z powodu problemów z OpenStreetMap API. Takie nie będą chciały się już rysować na widoku. W takich wypadkach można spróbować użyć angielskiej nazwy miejscowości, o ile jest ona dostępna w OpenStreetMap.

W przypadku innych miast losowo występuje drobny problem z deserializacją i algorytm nie chce wystartować (już na etapie jego uruchamiania). Kilkukrotnie powtórzona próba jego uruchomienia może pomóc.

### Uruchomienie algorytmu

Należy wpisać nazwę miasta, liczbę punktów do rozmieszczenia na grafie i typ algorytmu (brute force max do 3 punktów).

W celu nadania wag wierzchołkom grafu należy najpierw narysować graf i narysować obszary priorytetowe (przytrzymany klawisz Shift pozwala na rysowanie dowolnych obszarów, Esc na ich usuwanie), a następnie nadać im odpowiednie wagi z zakresu 1-10. Możliwe jest też automatyczne wygenerowanie wag z diagramu Woronoja (wystarczy zaznaczyć tę opcję na panelu).
