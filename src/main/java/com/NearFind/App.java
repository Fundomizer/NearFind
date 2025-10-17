package com.NearFind;

import com.NearFind.Utils.ViewUtils;
import com.gluonhq.attach.display.DisplayService;
import com.gluonhq.attach.util.Platform;
import com.gluonhq.charm.glisten.application.AppManager;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.geometry.Dimension2D;
import com.gluonhq.attach.util.Services;

public class App extends Application {

    private final AppManager appManager = AppManager.initialize(this::postInit);

    @Override
    public void init() throws Exception {
        appManager.addViewFactory(AppManager.HOME_VIEW, () -> ViewUtils.loadView("main-window"));
    }

    @Override
    public void start(Stage stage) throws Exception {
        appManager.start(stage);
    }

    public void postInit (Scene scene) {
        Services.get(DisplayService.class).ifPresent(display -> {
            Dimension2D res = display.getScreenResolution();
            System.out.println("Device resolution: " + res.getWidth() + " x " + res.getHeight());
        });

        // For testing
        if (Platform.isDesktop()) { // Set here some desktop specific things
            scene.getWindow().setWidth(450);
            scene.getWindow().setHeight(900);
        }
    }
}
