# NearFindMVP

## Setting up your environment

### Download Development Kits

For this project the following Development kits will be needed:

- JavaFX SDK 21.0.8 (July 2025) LTS - Can be downloaded [here](https://gluonhq.com/products/javafx/)
- JDK 21.0.8 - Can be downloaded [here](https://www.oracle.com/java/technologies/downloads/#java21)

Install the JDK and extract the sdk in a folder. Make sure to remember where you put the sdk

### Fixing up your project

As of the moment, if you execute the sample code you will be met with
`Error: JavaFX runtime components are missing, and are required to run this application`.
We have to set up a few things.

Add JavaFX sdk to your project's library you can do this via `Project Structure` ->
`Libraries` -> `New Project Library` -> `Java` -> Go to the directory of the sdk and press the `lib` folder.
With this set you can use the classes, constants, enums, etc. provided by JavaFX

Now to run the project you have to fix your **Run Configurations**. Go to run configurations,
`More Options` -> `Add VM options` -> enter the code below

```
--module-path "C:\path\to\javafx-sdk-21\lib" --add-modules javafx.controls,javafx.fxml
```

Make sure to replace the module path to your proper JavaFX lib directory. Ensure that you do this for every executable
that will utilise JavaFX

> If there's time I'll try to find better ways to configure our project. That is if I don't get lazy kek - Oway

## Gluon specifications

This Gluon sample was generated from https://start.gluon.io

## Basic Requirements

A list of the basic requirements can be found online in
the [Gluon documentation](https://docs.gluonhq.com/#_requirements).

## Quick instructions

### Run the sample on JVM/HotSpot:

    mvn gluonfx:run

### Run the sample as a native image:

    mvn gluonfx:build gluonfx:nativerun

### Run the sample as a native android image:

    mvn -Pandroid gluonfx:build gluonfx:package gluonfx:install gluonfx:nativerun

### Run the sample as a native iOS image:

    mvn -Pios gluonfx:build gluonfx:package gluonfx:install gluonfx:nativerun

## Selected features

This is a list of all the features that were selected when creating the sample:

### JavaFX 21.0.8 Modules

- javafx-base
- javafx-graphics
- javafx-controls
- javafx-fxml

### Gluon Features

- Glisten: build platform independent user interfaces
- Attach display
- Attach lifecycle
- Attach statusbar
- Attach storage

> Note we can more features (attach) later on via `pom.xml`