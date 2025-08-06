using Microsoft.AspNetCore.Mvc;

namespace CelebrateDesign.Areas.LandingPage.Controllers
{
    [Area("LandingPage")]
    public class SideNav2Controller : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
