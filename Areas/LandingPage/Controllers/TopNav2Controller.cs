using Microsoft.AspNetCore.Mvc;

namespace CelebrateDesign.Areas.LandingPage.Controllers
{
    [Area("LandingPage")]
    public class TopNav2Controller : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
