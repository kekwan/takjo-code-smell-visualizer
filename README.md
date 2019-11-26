# TAKJO Code Smell Visualizer

410 Visualization project by TAKJO

## Members
- Jakrarat (Jade) Chunnananda
- Kenny Kwan
- Tim Guo
- Oscar Tu
- Sadek

## About

![Visualizer Preview](https://i.imgur.com/zLvyqmU.png)

The Code Smell Visualizer allows Java project developers to analyze their code for certain code smells (currently from a choice of 4) which are:
* Law of Demeter
* Number of Lines
* Nesting
* Unused Methods

The visualizer then outputs a JSON file containing all calculated metrics and allows the user to start up a simple local web-app to view their metrics on their browser as an undirected graph, where each node represents a class. 

The graph allows the user to easily view the overall code smell score of the class as a whole as well as the individual methods' scores by simply clicking on the node representing that class. The visualization is color coded such that the user can easily identify classes or methods which have an unwanted score for each code smell (metric). 

### Division of Labour
* Jade: Unwanted Methods Analyzer
* Kenny: Visualization (D3) and web-app
* Tim: Lines Analyzer
* Oscar: Law of Demeter Analyzer
* Sadek: Utils, Nesting Analyzer
* Everyone: Bugs, optimization.

## Set up
`git clone` this repository

`yarn install` to install dependencies

`yarn start` to start a http server serving the files, then in a browser go to http://127.0.0.1:9001 to access the UI

