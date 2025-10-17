package com.NearFind.Controller;

import com.NearFind.Utils.ViewUtils;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.layout.Pane;

public class MainWindowController {
    @FXML
    private Pane CenterPane;

    @FXML
    public void initialize() {
        System.out.println("Hello, view has been initialised");
        onHome();
    }

    @FXML
    private void onCompare() {
        loadCenterContent("compare");
    }
    @FXML
    private void onCart() {
        loadCenterContent("cart");
    }

    @FXML
    private void onFavourites () {
        loadCenterContent("favourites");
    }

    @FXML
    private void onHome() {
        loadCenterContent("home");
    }

    private void loadCenterContent(String fxml) {
        Node content = ViewUtils.loadFXML(fxml);
        CenterPane.getChildren().setAll(content);
    }

}
