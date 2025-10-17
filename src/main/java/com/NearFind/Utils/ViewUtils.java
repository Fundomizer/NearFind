package com.NearFind.Utils;

import com.gluonhq.charm.glisten.mvc.View;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;

import java.io.IOException;

public class ViewUtils {

    /**
     * For Gluon specific. Reads a FXML file with a View root node and returns that node.
     *
     * @param fxmlFileName
     * @return
     */
    public static View loadView(String fxmlFileName) {
        try {
            return FXMLLoader.load(ViewUtils.class.getResource("/com/NearFind/app/" + fxmlFileName + ".fxml"));
        } catch (IOException e) {
            System.out.println("Lmao... IOException: " + e);
            return new View();
        }
    }

    /**
     * General JavaFX loader
     * @param fxmlFileName
     * @return
     */
    public static Node loadFXML(String fxmlFileName) {
        try {
            return FXMLLoader.load(ViewUtils.class.getResource("/com/NearFind/app/" + fxmlFileName + ".fxml"));
        } catch (IOException e) {
            System.out.println("Lmao... IOException: " + e);
            return new View();
        }
    }
}
