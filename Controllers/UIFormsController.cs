using Microsoft.AspNetCore.Mvc;

namespace CelebrateDesign.Controllers
{
    public class UIFormsController : Controller
    {
        public IActionResult General()
        {
            return View();
        }
        public IActionResult Multi_Steps()
        {
            return View();
        }
    }
}
