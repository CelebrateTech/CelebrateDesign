using Microsoft.AspNetCore.Mvc;

namespace CelebrateDesign.Controllers
{
    public class ThemeColorController : Controller
    {
        public IActionResult Background()
        {
            return View();
        }
        public IActionResult Border()
        {
            return View();
        }
        public IActionResult Text()
        {
            return View();
        }
    }
}
