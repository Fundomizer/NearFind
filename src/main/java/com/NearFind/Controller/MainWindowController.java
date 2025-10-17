package com.NearFind.Controller;

import com.NearFind.Utils.ViewUtils;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.layout.VBox;

public class MainWindowController {
    @FXML
    private VBox CenterPane;

    @FXML
    private void onHome() {
        loadCenterContent("home");
    }

    public void loadCenterContent(String fxml) {
        Node content = ViewUtils.loadFXML(fxml);
        CenterPane.getChildren().setAll(content);
    }

}
