# CityGrapher Visualizer

https://cg-visualizer.herokuapp.com/

## PL

Aplikacja dostępna jest pod linkiem u góry. Heroku jest darmowym narzędziem i potrzebuje chwili, aby się wybudzić. W razie problemów proszę o kontakt.

Aplikacja ma trzy moduły (powyższy frontendowy i dwa backendowe) i każdy musi się wcześniej wybudzić. Aby sprawdzić pierwszy backendowy moduł lub ręcznie go wybudzić, proszę wejść pod link:
https://cg-data-collector.herokuapp.com/dataCollector/test (powinien wyświetlić się `Hello, world!`).

Analogicznie drugi moduł backendowy:
https://cg-algorithm.herokuapp.com/algorithm/test (treść komunikatu ta sama). Rozwiązanie jest nieeeganckie, ale to stała wada darmowych narzędzi.

Niektóre miasta mogą nie działać z powodu problemów z OpenStreetMap API. Takie nie będą chciały się już rysować na widoku. W takich wypadkach można spróbować użyć angielskiej nazwy miejscowości, o ile jest ona dostępna w OpenStreetMap.

W przypadku innych miast losowo występuje drobny problem z deserializacją i algorytm nie chce wystartować (już na etapie jego uruchamiania). Kilkukrotnie powtórzona próba jego uruchomienia może pomóc.

### Uruchomienie algorytmu

Należy wpisać nazwę miasta, liczbę punktów do rozmieszczenia na grafie i typ algorytmu (brute force max do 3 punktów).

W celu nadania wag wierzchołkom grafu należy najpierw narysować graf i narysować obszary priorytetowe (przytrzymany klawisz Shift pozwala na rysowanie dowolnych obszarów, Esc na ich usuwanie), a następnie nadać im odpowiednie wagi z zakresu 1-10. Możliwe jest też automatyczne wygenerowanie wag z diagramu Woronoja (wystarczy zaznaczyć tę opcję na lewym panelu).


## ENG

The application is available at the link above. Heroku is a free tool and needs a moment to wake up. In case of any problems feel free to contact me.

An application has three modules (the frontend one and two backend modules) and each of them must be woken up. To check the first backend module or manually wake it up please go under link:
https://cg-data-collector.herokuapp.com/dataCollector/test (you should see `Hello, world!`).

Simirarly the second backend module:
https://cg-algorithm.herokuapp.com/algorithm/test (the same message as in the first one). The solution is not quite elegant but it's permanent disadvantage of using free tools.

Some of the cities won't work beacuse of the OpenStreetMaps API problems. Such cities will not be drawn on the view. In cases like these you can try to use the name of the city in another language but only if this name is present in OpenStreetMap.

In case of some cities there is a random error with deserialization and algorithm won't start (during execution stage). Repeated attempts to start it can help.

### Running an algorithm

Fill city name, number of points to locate on graph and an algorithm type (brute force up to 3 points).

In order to set node weights of the grapf you must firstly draw the graph and draw prioritized areas (hold Shift key to draw any shape, press Esc to remove prioritized areas) and then set corresponding weight values from range 1-10. It is also possible to automatically generate weights from thr Voronoi diagram (just check adequate option on the left panel).
