using Microsoft.AspNetCore.Mvc;

namespace CelebrateDesign.Controllers
{
    public class WelcomeController : Controller
    {
        public IActionResult Introduction()
        {
            return View();
        }
        public IActionResult Download()
        {
            return View();
        }
        public IActionResult Syntax()
        {
            return View();
        }
    }
}
