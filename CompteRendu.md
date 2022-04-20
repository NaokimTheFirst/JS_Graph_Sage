# Manipulation interactive des graphes avec Sage
Le logiciel SageMath, est un logiciel connu libre et open-source de calcul mathématiques très populaire auprès des scientifiques. Il contient une grande partie implémentée concernant les graphes et leurs algorithmes (le backend programmé en Python). En revanche le frontend est actuellement assez limité et l'utilisateur doit presque entièrement passer par la ligne de commandes. On peut visualiser les graphes en différents formats, et notamment sur un navigateur sous forme d'objets graphiques avec la librairie Javascript d3js, mais on ne peut pas les manipuler "à la main". L'an dernier une équipe d'étudiants de l'IUT avait produit une solution pour résoudre ce problème et permettre une manipulation interactive des graphes à travers un navigateur. Leur solution est ici : https://github.com/NaokimTheFirst/JS_Graph_Sage 

Le but du projet est de terminer le travail en enrichissant cette solution. Il s'agit d'ajouter des nouvelles fonctionnalités interactives de manipulations des dessins et les intégrer au projet SageMath. Une possibilité serait de programmer des déroulements d'algos de Sage existants sur un navigateur. Technos : Python (avec SageMath), Javascript, Git.

### Tuteur : Valicov

#### 24/01/2022 - 2e rdv avec tuteur
- Creation d'un fork : https://github.com/Dalwaj/JS_Graph_Sage
- Pull des modifications pour 'attach' par Jawad
- A faire : Diagramme de classes (+ sequences), ajouter les fonctionnalités à l'interface graphique (afficher nombre de sommets, déplacer la partie du graph sélectionnée...)

#### 03/02/2022 - 3e rdv avec tuteur
*Problèmes à resoudre :* 
- animation du drag d'une multiselection (à voir si c'est lié au renouvellement trop rapide du fenêtre),
- perte de connexion lors de renouvellement du fenetre, 
- absense de connexion inverse entre SageMath et JS_Graph,
- les types des sommets sont transformés en string lors de la connexion.

*Solution proposée pour le problème des strings :* créer un dictionnaire (une map) qui associe à chaque sommet v du graphe initial une chaîne de caractères cv qui est sa représentation textuelle que vous allez utiliser dans le format JSON. Toutes les opération que vous allez effectuer dans d3js sur cv seront transposé sur v à travers ce dictionnaire.

#### 10/02/2022 - 4e rdv
*Nouvelles choses à faire :* 
- voir les fichiers _things-to-add.md_ et _ToDo.md_.
- enovoyer le graph en JSON de Python à JavaScript pour remplacer le graphe precedent avec innerHTML (mission déjà accomplie :) ).
- pouvoir relancer la page sans perdre la connexion.

*Travail fait :*
- Mapping des sommets dans un dict pour preserver les types d'origin.
- Possibilite de modifier le graphe dans ls terminal et importer les changements dans l'interface graphique avec le bouton "Renew Graph".

#### 18/02/2022 - 5e rdv
*Nouvelles choses à faire :*
- Pour tout le monde : 
    1. faire le menage sur le dépôt en effaçant les fichiers de configuration (personnels), du type : .vscode, .idea, .class, .o etc.
    2. faire `git rm --cache obj/result.html`
    3. ajouter à gitignore : 
        ```
        .idea/
        .vs/
        .vscode/
        *.class
        *o
        ```
    4. faire `git add .` et `git commit`
- Comprendre comment D3.js marche dans le code et faire migrer vers une version plus récente. Voir les liens : 
https://observablehq.com/@d3/d3v6-migration-guide
https://blog.devgenius.io/d3-js-whats-new-in-version-6-5f45b00a85cb
- Permettre à l'utilisateur de sortir du terminal sage avec `exit`.
- Trouver un moyen de remplacer les getters dans InterfaceAndMisc.js par un seul getter.
- Les propriétés "lourdes" (qui prennent le temps pour que le sage les compte), ne doivent être affichées que si l'utilisateur les demande explicitement. Voir _things-to-add.md_/Hard Stuff.
- Chercher le moyen à copier le project board GitHub à un autre compte (organisation ou utilisateur) pour pouvoir le lier au dépot GitHub.
- Pour l'affichage de girth : Bug avec graphs.ClawGraph(), car girth est infinie. Il faut passer une exception dans le code.

*Travail fait :*
- Possibilite de modifier le graphe dans ls terminal et importer les changements dans l'interface graphique avec le bouton "Renew Graph" (Bouton à renommer et repositionner).
- Possibilité de refraichir la page sans perdre la connexion (permet d'importer les changements de même manière que "Renew Graph").
- Refraichir la page ou "Renew Graph" peuvent être utilisés pour repositionner le graph au centre de l'écran et optimiser ça taille.
- Diagramme de séquence pour le processus de connexion (mes changements dans le code original sont marqués en rouge).
- Affichage de plusieurs nouvelles propriétés du graph dans le menu : degrés max et min, is eulerian, hamiltonicity.
- Affichage du graph sous format G6.
- Possibilité de questionner le site _The House Of Graphs_ si le graphe obtenu est déjà connu.
- Project Board crée sur GitHub pour le backlog de nos user stories (à deplacer). Voir : https://github.com/users/sea-gull-diana/projects/1/

#### 25/02/2022 - 6e rdv
*Nouvelles choses à faire :*
- Changer ownership du dépot vers une organisation (et copier-coller le project board vers cette organisation).
- Comment attribuer des portes ? Coder en dur ou choisir n'importe quel porte disponible (voir si les portes sont regroupées par famille et on peut choisir une famille à utiliser).
- Changer la méthode de coloration optimale. Utiliser la fonction du sage plus optimale (voir email).
- La division en groupes à enlever (fonctionnalité non finie, donc le champ du groupe dans le menu sert à rien).
- La prémière ébauche du rapport à faire et envoyer à M. Valicov pendant les vacances.

*Travail fait :*
- Connexion aux portes différentes selon la disponibilité (bugs à fixer voir au-dessus).
- Spanning tree (coloration des arêtes d'un arbre couvrant).

#### 30/03/2022 - 7e rdv
*Nouvelles choses à faire :*
- Faire une réunion du groupe pour merge tout ce qu'on a fait sur GitHub (LE PLUS IMPORTANT - faire avant le rdv suivant).
- Encore quelques boutons à ajouter (voir Project Board).
- Edge contruction

*Travail fait :*
- Affichage des classes de coloration sous la forme du texte
- Bug fixé dans l'affichage de l'arbre recouvrant
- Plan du rapport preparé ;
- Redaction du rapport commencé : [voir document sur OneDrive](https://1drv.ms/w/s!Ah20cN1s-zt3h78TY4GmdzCLvJmvOQ?e=JR4fun).

#### 11/04/2022 - 9e rdv
*Nouvelles choses à faire :*
- Separer dans le menu Orientations et Algorithmic/Hard Stuff
- Resoudre le probleme : les sommets recoivent les coordonées qu'ils n'ont pas a l'origin
Lorsqu'on dessine le graph avec `show_CustomJS`, on ajoute les coordonées aux sommets, l'objet change donc de nature.
**Solution :** 
Faire un bouton("save") qui permet de fixer l'embedding (la possibilité de freeze les coordonéees des sommets). Mais si on ne clique pas ce bouton, les sommets ne doivent pas avoir des coordonnes.
**Fonctions utiles :**
`set_pos()` pour donner les coordonnees aux sommets.
`graph.set_embedding()` position des sommets par rapport l'un a l'autre.
- Utiliser le layout `spring` de Sage par defaut dans `show_CustomJS` pour bien dessiner le graphe.
- Edge contraction : plutot que `graph.contract_edge(0,1)`, utiliser la methode `graph.merge_vertices()`

*Travail fait :*
- merge des branches effectué (branche `obada` et les dernieres versions des branches `jawad` et `mathis` en attente)
- Problème de "Girth" reglé, mais pas encore ajouté à master
- Bug corrigé dans l'affichage des graphes avec des sommets de type objet

**Prochaine reunion :** mercredi 20/04 a 9h00
#### 20/04/2022 - 8e rdv
*Nouvelles choses à faire :*
- Nettoyer le code
- Merge des sommets (effectuer le merge sur `newgraph` et pas `targetgraph`, puis l'importer vers interface). 
- Migration D3.js
- Restructurer l'interface
- Merge de tout ce qui reste sur la branche `master`.

*Travail fait :*
- Fonctionnalité *Save* (autosauvegarde par defaut, possible de le desactiver en cliquant 'U' et sauvegarder les changements en cliquant 'S').
- Fonctionnalité *Freeze positions* en cliquant 'F' (layout `spring` par defaut s'il n'y a pas de positions fixes).
- Dark et Light Mode avec l'utilisation des cookies pour sauvegarder les preferences de l'utilisateur.

**Prochaine reunion :** mercredi 03/05 a 9h00
