using NearFind.Views;

namespace NearFind
{
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();

            MainPage = new MainLayoutPage();
        }
    }
}
