package com.NearFind.Utils;

import com.gluonhq.charm.glisten.mvc.View;
import javafx.fxml.FXMLLoader;

import java.io.IOException;

public class ViewUtils {
    public static View loadView(String fxmlFileName) {
        try {
            return FXMLLoader.load(ViewUtils.class.getResource("/com/NearFind/app/" + fxmlFileName +".fxml"));
        } catch (IOException e) {
            System.out.println("Lmao... IOException: " + e);
            return new View();
        }
    }
}
